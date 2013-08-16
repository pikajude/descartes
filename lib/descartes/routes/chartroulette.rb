module Descartes
  class Web < Sinatra::Base

    get '/chartroulette/?' do
      if request.accept.include?("application/json")
        favorites = User.filter(:email => session['user']['email']).first.favorites
        content_type 'application/json'
        status 200
        Dashboard.filter(:enabled => true).where(:uuid => favorites).to_json
      else
        fullscreen = params[:fullscreen] === 'true' ? true : false
        haml :chartroulette, :locals => { :title => 'Descartes - Chartroulette', :fullscreen => fullscreen }
      end
    end
  end
end