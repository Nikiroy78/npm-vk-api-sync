# Sync VK API module

**installation:**
```bash
npm i vk_api
```
## How to use

### Step 1: Create VK API instance

You can logged in with use login and password:
```node
const vkApi = require('vk_api');
const vk = new vkApi.VkApi({
	login    : '+78005553535',
	password : 'qwerty123'
});
```
or with use access_token
```node
const vkApi = require('vk_api');
const vk = new vkApi.VkApi({
	access_token : "ACCESS_TOKEN_STRING"
});
```
**Additional parametrs**  
In constructor you can edit **api_version**, **api_server** and **oauth_server**:
```node
const vkApi = require('vk_api');
const authOptions = { /* Another auth params */ };

const API_VERSION = "5.75";
const API_SERVER = "https://api.vk.com/";
const OAUTH_SERVER = "http://oauth.vk.com/";

const vk = new vkApi.VkApi(
	authOptions,
	API_VERSION,
	API_SERVER,
	OAUTH_SERVER
);
```
### Step 2: Call VK API Methods
You can use method **api** for call api methods.
```node
const userObject = vk.api("users.get", {
	user_ids : [1].join(",")
}); // [{ id : 1, first_name : "Pavel", last_name : "Durov" }]
```
### Additional tools
You can use method **exec** for call api method **Execute**.
```node
const vkScript = `var userObject = API.users.get({"user_ids":[1]});

return userObject[0];`;
const userObject = vk.exec(vkScript); // { id : 1, first_name : "Pavel", last_name : "Durov" }
```
And you can use additional tool for upload doc into server. Use method **uploadDoc** *(method at beta-develop)*  
```node
const fs = require('fs');

const filename = "picture.png";
const mimetype = "image/png";
const content = fs.readFileSync(`/path/to/${filename}`);
const peer_id = 42;  // The Ultimate Question of Life, the Universe, and Everything :)

const userObject = vk.uploadDoc(filename, content, mimetype, peer_id); // Content from method 'docs.save'
```