require 'redis'
require 'time'

module Orion

  class Server < EM::Connection

    def initialize
      @rd = Redis.new Orion::Config[:redis]

      Signal.trap("SIGINT") { exit }
    end

    def exit
      EM.stop if EM.reactor_running?
    end

    def receive_data(data)
      announcements = JSON.parse(data)

      announcements.each do |k,v|
        add_announcement(k, v)
      end
    end

    def add_announcement(key, value)
      time = Time.parse(value["timestamp"]).to_i

      @rd.sadd('services', key)
      @rd.zadd(key, time , value.to_json)
    end

  end

end