local HttpService = game:GetService("HttpService")
local BASE_URL = 'YOUR_APP_ENGINE_URL'
local PROFILES_URL = BASE_URL..'/profiles/'
local API_KEY = 'YOUR_API_KEY'


local ProfileAPIModule = {
	getProfileData = function(userId)
		local profileData

		local success, error = pcall(function()
			profileData = HttpService:GetAsync(PROFILES_URL..userId..'?key='..API_KEY)
		end)

		if error then
			print(error)
			return nil
		end

		local profile = HttpService:JSONDecode(profileData)

		return profile
	end,
	saveProfileData = function(userId, experiencePoints)
		local profileData = {experiencePoints = experiencePoints, key = API_KEY}
		local encodedData = HttpService:JSONEncode(profileData)


		local response

		local success, error = pcall(function()
			response = HttpService:PostAsync(PROFILES_URL..userId, encodedData)
		end)

		if error then
			print(error)
			return nil
		end

		return response
	end
}

return ProfileAPIModule
