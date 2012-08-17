require 'mixlib/config'

module Orion

  class Config
    extend Mixlib::Config

    redis Hash.new

    host '127.0.0.1'
    server_port 8181
    web_port 8000

  end

end