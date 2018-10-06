var search_data = {"index":{"searchIndex":["luigi","baseunknownerror","cache","luigierror","template","unknownfiltererror","unknownkeyerror","unknowntemplateerror","'%'()","[]()","new()","new()","new()","new()","new()","new()","run()","run()","run()","to_s()"],"longSearchIndex":["luigi","luigi::baseunknownerror","luigi::cache","luigi::luigierror","luigi::template","luigi::unknownfiltererror","luigi::unknownkeyerror","luigi::unknowntemplateerror","luigi::template#'%'()","luigi::cache#[]()","luigi::baseunknownerror::new()","luigi::cache::new()","luigi::template::new()","luigi::unknownfiltererror::new()","luigi::unknownkeyerror::new()","luigi::unknowntemplateerror::new()","luigi::cache#run()","luigi::template::run()","luigi::template#run()","luigi::template#to_s()"],"info":[["Luigi","","Luigi.html","","<p>Top-level Luigi namespace.  See Luigi::Template for details.\n<p>Example:\n\n<pre># load luigi template\nrequire &#39;luigi-template&#39; ...</pre>\n"],["Luigi::BaseUnknownError","","Luigi/BaseUnknownError.html","","<p>Base class for unknown entry errors raised by Luigi Template.\n"],["Luigi::Cache","","Luigi/Cache.html","","<p>Minimal lazy-loading template cache.\n<p>Group a set of templates together and only parse them on an as-needed …\n"],["Luigi::LuigiError","","Luigi/LuigiError.html","","<p>Base class for all errors raised by Luigi Template.\n"],["Luigi::Template","","Luigi/Template.html","","<p>Template class.\n<p>Parse a template string into a Luigi::Template instance, and then apply the\nLuigi::Template …\n"],["Luigi::UnknownFilterError","","Luigi/UnknownFilterError.html","","<p>Thrown by Luigi::Template#run when an unknown filter is encountered.\n<p>The unknown filter name is available …\n"],["Luigi::UnknownKeyError","","Luigi/UnknownKeyError.html","","<p>Thrown by Luigi::Template#run when an unknown key is encountered.\n<p>The key is available in the <code>name</code> attribute. …\n"],["Luigi::UnknownTemplateError","","Luigi/UnknownTemplateError.html","","<p>Thrown by Luigi::Cache#run when an unknown template is encountered.\n<p>The unknown template name is available …\n"],["'%'","Luigi::Template","Luigi/Template.html#method-i-27-25-27","(args)",""],["[]","Luigi::Cache","Luigi/Cache.html#method-i-5B-5D","(key)","<p>Get given template, or raise an UnknownTemplateError if the given template\ndoes not exist.\n<p>Example:\n\n<pre class=\"ruby\"><span class=\"ruby-comment\"># create ...</span>\n</pre>\n"],["new","Luigi::BaseUnknownError","Luigi/BaseUnknownError.html#method-c-new","(type, name)","<p>Create a new BaseUnknownError instance.\n<p>Parameters:\n<p><code>type</code>: Type name (ex: “template”, “filter”, …\n"],["new","Luigi::Cache","Luigi/Cache.html#method-c-new","(strings, filters = FILTERS)","<p>Create a new template cache with the given templates.\n<p>Parameters:\n<p><code>strings</code>: Map of template names to template …\n"],["new","Luigi::Template","Luigi/Template.html#method-c-new","(str, filters = FILTERS)","<p>Create a new Template from the given string.\n"],["new","Luigi::UnknownFilterError","Luigi/UnknownFilterError.html#method-c-new","(name)","<p>Create a new UnknownFilterError instance.\n<p>Parameters:\n<p><code>name</code>: Name of the unknown filter.\n"],["new","Luigi::UnknownKeyError","Luigi/UnknownKeyError.html#method-c-new","(name)","<p>Create a new UnknownFilterError instance.\n<p>Parameters:\n<p><code>name</code>: Unknown key.\n"],["new","Luigi::UnknownTemplateError","Luigi/UnknownTemplateError.html#method-c-new","(name)","<p>Create a new UnknownTemplateError instance.\n<p>Parameters:\n<p><code>name</code>: Unknown template name.\n"],["run","Luigi::Cache","Luigi/Cache.html#method-i-run","(key, args)","<p>Run specified template from cache with the given templates.\n<p>Raises an UnknownTemplateError if the given …\n"],["run","Luigi::Template","Luigi/Template.html#method-c-run","(str, args = {}, filters = FILTERS)","<p>Create a new template, expand it with the given arguments and filters, and\nprint the result.\n<p>Parameters: …\n"],["run","Luigi::Template","Luigi/Template.html#method-i-run","(args)","<p>Expand template with the given arguments and return the result.\n<p>Parameters:\n<p><code>args</code>: Argument key/value map. …\n"],["to_s","Luigi::Template","Luigi/Template.html#method-i-to_s","()","<p>Return the input template string.\n<p>Example:\n\n<pre># create a template object\ntmpl = Luigi::Template.new(&#39;hello ...</pre>\n"]]}}