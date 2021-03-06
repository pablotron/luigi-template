require_relative './lib/luigi-template.rb'

Gem::Specification.new do |s|
  s.name        = 'luigi-template'
  s.version     = Luigi::VERSION
  s.date        = '2018-09-05'
  s.summary     = 'Simple string templating library.'
  s.description = 'Simple string templating library.'
  s.authors     = ['Paul Duncan']
  s.email       = 'pabs@pablotron.org'
  s.homepage    = 'https://github.com/pablotron/luigi-template'
  s.license     = 'MIT'
  s.files       = Dir['{lib,test}/*.rb'] + %w{README.mkd Rakefile}
end
