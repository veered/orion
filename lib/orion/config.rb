require 'mixlib/config'

module Orion

  class Config
    extend Mixlib::Config

    redis Hash.new

    server_host 'localhost'
    server_port 8001

    web_host 'localhost'
    web_port 8000

  end

end