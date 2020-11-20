local Players = game:GetService('Players')
local ProfileAPI = require(script.Parent.ProfileAPIModule)

local profileDataForPlayer1 = ProfileAPI.getProfileData(1)
print(profileDataForPlayer1["id"], profileDataForPlayer1["experiencePoints"])

local profileDataForPlayerWithNoData = ProfileAPI.getProfileData(111)

if profileDataForPlayerWithNoData == nil then
	print("Couldn't find profile data for player 111")
end

ProfileAPI.saveProfileData(5, 20)
local profileDataForPlayer5 = ProfileAPI.getProfileData(5)

print(profileDataForPlayer5["experiencePoints"].."== 20")
