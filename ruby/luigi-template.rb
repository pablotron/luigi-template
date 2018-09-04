# require 'pp'

module Luigi
  #
  # library version
  #
  VERSION = '0.4.0'

  #
  # built-in filters
  #
  FILTERS = {
    # upper-case string
    uc: proc { |v, args, row, t|
      (v || '').to_s.upcase
    },

    # lower-case string
    lc: proc { |v, args, row, t|
      (v || '').to_s.downcase
    },

    # html-escape string
    h: proc { |v, args, row, t|
      (v || '').to_s.gsub(/&/, '&amp;').gsub(/</, '&lt;').gsub(/>/, '&gt;').gsub(/'/, '&apos').gsub(/"/, '&quot;')
    },

    # uri-escape string
    u: proc( { |v, args, row, t|
      require 'uri'
      URI.escape((v || '').to_s)
    },

    # json-encode value
    json: proc { |v, args, row, t|
      require 'json'
      v.to_json
    },

    # trim leading and trailing whitespace from string
    trim: proc { |v, args, row, t|
      (v || '').to_s.strip
    },

    # base64-encode string
    base64: proc { |v, args, row, t|
      [(v || '').to_s].pack('m')
    },

    # hash string
    hash: proc { |v, args, row, t|
      require 'openssl'
      OpenSSL::Digest.new(args[0] || 'md5').hexdigest((v || '').to_s)
    },
  }

  #
  # Template parser.
  #
  module Parser
    RES = {
      action: %r{
        # match opening brace
        %\{

        # match optional whitespace
        \s*

        # match key
        (?<key>[^\s\|\}]+)

        # match filter(s)
        (?<filters>(\s*\|(\s*[^\s\|\}]+)+)*)

        # match optional whitespace
        \s*

        # match closing brace
        \}

        # or match up all non-% chars or a single % char
        | (?<text>[^%]* | %)
      }mx,

      filter: %r{
        # match filter name
        (?<name>\S+)

        # match filter arguments (optional)
        (?<args>(\s*\S+)*)

        # optional trailing whitespace
        \s*
      }mx,

      delim_filters: %r{
        \s*\|\s*
      }mx,

      delim_args: %r{
        \s+
      },
    }

    #
    # Parse a (possibly empty) string into an array of actions.
    #
    def self.parse_template(str)
      str.scan(RES[:action]).map { |m|
        if m[0] && m[0].length > 0
          r = {
            type: :action,
            key: m[0].intern,
            filters: parse_filters(m[1]),
          }
        else
          # literal text
          r = { type: :text, text: m[2] }
        end

        # pp r

        # return result
        r
      }
    end

    #
    # Parse a (possibly empty) string into an array of filters.
    #
    def self.parse_filters(str)
      # strip leading and trailing whitespace
      str = (str || '').strip

      if str.length > 0
        str.strip.split(RES[:delim_filters]).inject([]) do |r, f|
          # strip whitespace
          f = f.strip

          if f.length > 0
            md = f.match(RES[:filter])
            raise "invalid filter: #{f}" unless md
            # pp md

            # get args
            args = md[:args].strip

            # add to result
            r << {
              name: md[:name].intern,
              args: args.length > 0 ? args.split(RES[:delim_args]) : [],
            }
          end

          # return result
          r
        end
      else
        # return empty filter set
        []
      end
    end
  end

  #
  # Template class.
  #
  class Template
    #
    # Create a new Template from the given string.
    #
    def initialize(str, filters = FILTERS)
      @str, @filters = str, filters
      @actions = Parser.parse_template(str)
    end

    #
    # Run template with given arguments
    #
    def run(args)
      @actions.map { |a|
        # pp a

        case a[:type]
        when :action
          # check key and get value
          val = if args.key?(a[:key])
            args[a[:key]]
          elsif args.key?(a[:key].to_s)
            args[a[:key].to_s]
          else
            # invalid key
            raise "unknown argument: #{a[:key]}"
          end

          # filter value
          a[:filters].inject(val) do |r, f|
            # check filter name
            raise "unknown filter: #{f[:name]}" unless @filters.key?(f[:name])

            # call filter, return result
            @filters[f[:name]].call(r, f[:args], args, self)
          end
        when :text
          # literal text
          a[:text]
        else
          # never reached
          raise "unknown action type: #{a[:type]}"
        end
      }.join
    end
  end

  #
  # Simple template cache.
  #
  class Cache
    #
    # Create a new template cache with the given templates
    #
    def initialize(strings, filters = FILTERS)
      @templates = Hash.new do |h, k|
        # always deal with symbols
        k = k.intern

        # make sure template exists
        raise "unknown template: #{k}" unless strings.key?(k)

        # create template
        h[k] = Template.new(strings[k], filters)
      end
    end

    #
    # Run specified template with given arguments.
    #
    def run(key, args)
      # run template with args and return result
      @templates[key].run(args)
    end
  end

  #
  # test module
  #
  module Test
    # test template
    TEMPLATE = '
      basic test: hello %{name}
      test filters: hello %{name | uc | base64 | hash sha1}
      test custom: hello %{name|custom}
      test custom_with_arg: %{name|custom_with_arg asdf}
    '

    CUSTOM_FILTERS = {
      custom: proc {
        'custom'
      },

      custom_with_arg: proc { |v, args|
        args.first || 'custom'
      },
    }

    # test template cache
    CACHE = {
      test: TEMPLATE
    }

    # test arguments
    ARGS = {
      name: 'paul',
    }

    def self.run
      # add custom filters
      Luigi::FILTERS.update(CUSTOM_FILTERS)

      # test individual template
      puts Template.new(TEMPLATE).run(ARGS)

      # test template cache
      puts Cache.new(CACHE).run(:test, ARGS)
    end
  end
end

Luigi::Test.run if __FILE__ == $0