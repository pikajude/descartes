require 'cgi'
require 'uri'

module Descartes
  class Web < Sinatra::Base

    GRAPHITE_URL = URI.parse(ENV['GRAPHITE_URL'])
    if (!ENV['GRAPHITE_USER'].empty? && !ENV['GRAPHITE_PASS'].empty?)
      GRAPHITE_URL.user = ENV['GRAPHITE_USER']
      GRAPHITE_URL.password = CGI.escape(ENV['GRAPHITE_PASS'])
    end

    def proxy(fullpath)
      resource = RestClient::Resource.new("#{GRAPHITE_URL.to_s}#{fullpath}", :timeout => -1)
      response = resource.get

      response_headers = {}
      response.raw_headers.each do |key, value|
        header_value = (value.is_a?(Array) ? value.join(',') : value)
        case key
          when /cache-control/i
            cache_control header_value
          when /content-encoding/i
            #ignore
          when /content-length/i
            #ignore
          when /content-type/i
            content_type header_value
          when /etag/i
            etag header_value
          when /expires/i
            expires header_value
          when /last-modified/i
            last_modified header_value
          else
            response_headers[key.to_s] = header_value
        end
      end
      headers response_headers
      status response.code
      response
    end

    get '/render/*' do
      proxy(request.fullpath)
    end

    get '/browser/*' do
      proxy(request.fullpath)
    end
  end
end
