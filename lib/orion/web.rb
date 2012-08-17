require 'sinatra/base'
require 'redis'
require 'time'

module Orion

  class Web < Sinatra::Base

    def initialize(*)
      super
      @rd = Redis.new Orion::Config[:redis]
    end

    before do
      content_type 'application/json'
    end

    get '/' do
      params[:date] ||= Time.now.to_i

      date = params[:date].to_i
      get_announcements(date).to_json
    end

    get '/diff' do
      params[:name] ||= ''
      get_diffs(params[:name]).to_json
    end

    helpers do 

      def get_announcements(date)
        output = {}

        services = @rd.smembers('services')
        services.each do |service|
          diffs = @rd.zrevrangebyscore(service, date, 0, :limit => [0, 1])
          output[service] = JSON.parse(diffs.first) unless diffs.empty?
        end

        output
      end

      def get_diffs(service)
        diffs = @rd.zrangebyscore(service, 0, Float::INFINITY)
        diffs.map { |d| JSON.parse(d) }
      end

    end

  end

end