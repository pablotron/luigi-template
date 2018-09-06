require 'uri'
require 'json'
require 'openssl'
# require 'pp'

#
# String templating library.  See Luigi::Template for details.
#
module Luigi
  #
  # Version of Luigi Template.
  #
  VERSION = '0.4.2'

  #
  # Base class for all errors raised by Luigi Template.
  #
  class LuigiError < Exception
  end

  #
  # Base class for unknown entry errors raised by Luigi Template.
  #
  class BaseUnknownError < LuigiError
    #
    # Type of unknown entry (Symbol).
    #
    attr_reader :type

    #
    # Name of unknown entry (String).
    #
    attr_reader :name

    #
    # Create a new BaseUnknownError instance.
    #
    # Parameters:
    #
    # * +type+: Type name (ex: "template", "filter", or "key").
    # * +name+: Item name.
    #
    def initialize(type, name)
      @type, @name = type, name
      super("unknown #{type}: #{name}")
    end
  end

  #
  # Thrown by Luigi::Template#run when an unknown key is encountered.
  #
  # The key is available in the +name+ attribute.
  #
  class UnknownKeyError < BaseUnknownError
    #
    # Create a new UnknownFilterError instance.
    #
    # Parameters:
    #
    # * +name+: Unknown key.
    #
    def initialize(name)
      super(:key, name)
    end
  end

  #
  # Thrown by Luigi::Template#run when an unknown filter is encountered.
  #
  # The unknown filter name is available in the +name+ attribute.
  #
  class UnknownFilterError < BaseUnknownError
    #
    # Create a new UnknownFilterError instance.
    #
    # Parameters:
    #
    # * +name+: Name of the unknown filter.
    #
    def initialize(name)
      super(:filter, name)
    end
  end


  #
  # Thrown by Luigi::Cache#run when an unknown template is encountered.
  #
  # The unknown template name is available in the +name+ attribute.
  #
  class UnknownTemplateError < BaseUnknownError
    #
    # Create a new UnknownTemplateError instance.
    #
    # Parameters:
    #
    # * +name+: Unknown template name.
    #
    def initialize(name)
      super(:template, name);
    end
  end

  #
  # HTML entity map.
  #
  # Used by built-in +h+ filter.
  #
  HTML_ENTITIES = {
    38 => '&amp;',
    60 => '&lt;',
    62 => '&gt;',
    34 => '&quot;',
    39 => '&apos;',
  }

  #
  # Map of built-in global filters.
  #
  # Default Filters:
  #
  # * +uc+: Convert string to upper-case.
  # * +lc+: Convert string to lower-case.
  # * +h+: HTML-escape string.
  # * +u+: URL-escape string.
  # * +json+: JSON-encode value.
  # * +trim+: Strip leading and trailing whitespace from string.
  # * +base64+: Base64-encode value.
  # * +hash+: Hash value.  Requires hash algorithm parameter (ex:
  #   "sha1", "md5", etc).
  #
  # You can add your own global filters, like so:
  #
  #     # create custom global filter named 'foobarify'
  #     Luigi::FILTERS[:foobarify] = proc { |s| "foo-#{s}-bar" }
  #
  #     # create template which uses custom "foobarify" filter
  #     tmpl = Luigi::Template.new('hello %{name | foobarify}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul'
  #     })
  #
  #     # prints "hello foo-Paul-bar"
  #
  FILTERS = {
    # upper-case string
    uc: proc { |v|
      (v || '').to_s.upcase
    },

    # lower-case string
    lc: proc { |v|
      (v || '').to_s.downcase
    },

    # html-escape string
    h: proc { |v|
      (v || '').to_s.bytes.map { |b|
        if b < 32 || b > 126
          "&##{b};"
        elsif HTML_ENTITIES.key?(b)
          HTML_ENTITIES[b]
        else
          b.chr
        end
      }.join
    },

    # uri-escape string
    u: proc { |v|
      URI.encode_www_form_component((v || '').to_s)
    },

    # json-encode value
    json: proc { |v|
      JSON.unparse(v)
    },

    # trim leading and trailing whitespace from string
    trim: proc { |v, args, row, t|
      (v || '').to_s.strip
    },

    # base64-encode string
    base64: proc { |v, args, row, t|
      [(v || '').to_s].pack('m').strip
    },

    # hash string
    hash: proc { |v, args, row, t|
      OpenSSL::Digest.new(args[0]).hexdigest((v || '').to_s)
    },
  }

  #
  # Template parser.
  #
  module Parser # :nodoc: all
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
    }.reduce({}) do |r, row|
      r[row[0]] = row[1].freeze
      r
    end.freeze

    #
    # Parse a (possibly empty) string into an array of actions.
    #
    def self.parse_template(str)
      str.scan(RES[:action]).map { |m|
        if m[0] && m[0].length > 0
          fs = parse_filters(m[1]).freeze
          { type: :action, key: m[0].intern, filters: fs }
        else
          # literal text
          { type: :text, text: m[2].freeze }
        end.freeze
      }.freeze
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
  # Parse a template string into a Luigi::Template instance, and then
  # apply the Luigi::Template via the Luigi::Template#run() method.
  #
  # Example:
  #
  #     # load luigi template
  #     require 'luigi-template'
  #
  #     # create template
  #     tmpl = Luigi::Template.new('hello %{name}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul'
  #     })
  #
  #     # prints "hello Paul"
  #
  # You can also filter values in templates, using the pipe symbol:
  #
  #     # create template that converts name to upper-case
  #     tmpl = Luigi::Template.new('hello %{name | uc}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul'
  #     })
  #
  #     # prints "hello PAUL"
  #
  # Filters can be chained:
  #
  #     # create template that converts name to upper-case and then
  #     # strips leading and trailing whitespace
  #     tmpl = Luigi::Template.new('hello %{name | uc | trim}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: '   Paul    '
  #     })
  #
  #     # prints "hello PAUL"
  #
  # Filters can take arguments:
  #
  #     # create template that converts name to lowercase and then
  #     # calculates the SHA-1 digest of the result
  #     tmpl = Luigi::Template.new('hello %{name | lc | hash sha1}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul',
  #     })
  #
  #     # prints "hello a027184a55211cd23e3f3094f1fdc728df5e0500"
  #
  # You can define custom global filters:
  #
  #     # create custom global filter named 'foobarify'
  #     Luigi::FILTERS[:foobarify] = proc { |s| "foo-#{s}-bar" }
  #
  #     # create template which uses custom "foobarify" filter
  #     tmpl = Luigi::Template.new('hello %{name | foobarify}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul'
  #     })
  #
  #     # prints "hello foo-Paul-bar"
  #
  # Or define custom filters for a template:
  #
  #     # create template with custom filters rather than global filters
  #     tmpl = Luigi::Template.new('hello %{name | reverse}', {
  #       reverse: proc { |s| s.reverse }
  #     })
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       name: 'Paul',
  #     })
  #
  #     # prints "hello luaP"
  #
  # Your custom filters can accept arguments, too:
  #
  #     # create custom global filter named 'foobarify'
  #     Luigi::FILTERS[:wrap] = proc { |s, args|
  #       case args.length
  #       when 2
  #         '(%s, %s, %s)' % [args[0], s, args[1]]
  #       when 1
  #         '(%s in %s)' % [s, args[0]]
  #       when 0
  #         s
  #       else
  #         raise 'invalid argument count'
  #       end
  #     }
  #
  #     # create template that uses custom "wrap" filter
  #     tmpl = Luigi::Template.new('sandwich: %{meat | wrap slice heel}, taco: %{meat | wrap shell}')
  #
  #     # run template and print result
  #     puts tmpl.run({
  #       meat: 'chicken'
  #     })
  #
  #     # prints "sandwich: (slice, chicken, heel), taco: (chicken in shell)"
  #
  class Template
    #
    # Original template string.
    #
    attr_reader :str

    #
    # Create a new template, expand it with the given arguments and
    # filters, and print the result.
    #
    # Parameters:
    #
    # * +str+: Template string.
    # * +args+: Argument key/value map.
    # * +filters+: Hash of filters.  Defaults to Luigi::FILTERS if
    #   unspecified.
    #
    # Example:
    #
    #     # create a template object, expand it, and print the result
    #     puts Luigi::Template.run('hello %{name}', {
    #       name: 'Paul'
    #     })
    #
    #     # prints "hello Paul"
    #
    def self.run(str, args = {}, filters = FILTERS)
      Template.new(str, filters).run(args)
    end

    #
    # Create a new Template from the given string.
    #
    def initialize(str, filters = FILTERS)
      @str, @filters = str.freeze, filters
      @actions = Parser.parse_template(str).freeze
    end

    #
    # Expand template with the given arguments and return the result.
    #
    # Parameters:
    #
    # * +args+: Argument key/value map.
    #
    # Example:
    #
    #     # create a template object
    #     tmpl = Luigi::Template.new('hello %{name}')
    #
    #     # apply template, print result
    #     puts tmpl.run({ name: 'Paul'})
    #
    #     # prints "hello Paul"
    #
    # This method is aliased as "%", so you can do this:
    #
    #     # create template
    #     tmpl = Luigi::Template.new('hello %{name | uc}')
    #
    #     # run template and print result
    #     puts tmpl % { name: 'Paul' }
    #
    #     # prints "hello PAUL"
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
            raise UnknownKeyError.new(a[:key])
          end

          # filter value
          a[:filters].inject(val) do |r, f|
            # check filter name
            unless @filters.key?(f[:name])
              raise UnknownFilterError.new(f[:name])
            end

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

    alias :'%' :run

    #
    # Return the input template string.
    #
    # Example:
    #
    #     # create a template object
    #     tmpl = Luigi::Template.new('hello %{name}')
    #
    #     # create a template object
    #     puts tmpl.to_s
    #
    #     # prints "hello %{name}"
    #
    def to_s
      @str
    end
  end

  #
  # Minimal lazy-loading template cache.
  #
  # Group a set of templates together and only parse them on an
  # as-needed basis.
  #
  class Cache
    #
    # Create a new template cache with the given templates.
    #
    # Parameters:
    #
    # * +strings+: Map of template names to template strings.
    # * +filters+: Hash of filters.  Defaults to Luigi::FILTERS if
    #   unspecified.
    #
    # Example:
    #
    #     # create template cache
    #     cache = Luigi::Cache.new({
    #       hi: 'hi %{name}!'
    #     })
    #
    #     # run template from cache
    #     puts cache.run(:hi, {
    #       name: 'Paul'
    #     })
    #
    #     # prints "hi paul!"
    #
    def initialize(strings, filters = FILTERS)
      # work with frozen copy of strings hash
      strings = strings.freeze

      @templates = Hash.new do |h, k|
        # always deal with symbols
        k = k.intern

        # make sure template exists
        raise UnknownTemplateError.new(k) unless strings.key?(k)

        # create template
        h[k] = Template.new(strings[k], filters)
      end
    end

    #
    # Get given template, or raise an UnknownTemplateError if the given
    # template does not exist.
    #
    # Example:
    #
    #     # create template cache
    #     cache = Luigi::Cache.new({
    #       hi: 'hi %{name}!'
    #     })
    #
    #     # get template from cache
    #     tmpl = cache[:hi]
    #
    #     # run template, print result
    #     puts tmpl.run(:hi, {
    #       name: 'Paul'
    #     })
    #
    #     # prints "hi Paul"
    #
    def [](key)
      @templates[key]
    end

    #
    # Run specified template from cache with the given templates.
    #
    # Raises an UnknownTemplateError if the given template key does not
    # exist.
    #
    # Parameters:
    #
    # * +key+: Template key.
    # * +args+: Argument key/value map.
    #
    # Example:
    #
    #     # create template cache
    #     cache = Luigi::Cache.new({
    #       hi: 'hi %{name}!'
    #     })
    #
    #     # run template from cache
    #     puts cache.run(:hi, {
    #       name: 'Paul'
    #     })
    #
    #     # prints "hi paul!"
    #
    def run(key, args)
      # run template with args and return result
      @templates[key].run(args)
    end
  end
end
