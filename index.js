const request = require('sync-request');

// Module from vk api
class vkApi_exception extends Error {
    constructor(message, error_code, request_params) {
        super(message); // (1)
        this.name = "VkApiError"; // (2)
		this.error_code = error_code;
		this.request_params = request_params;
    }
}


function GetParams(params) {
	if (Object.keys(params).length == 0) return '';
	// params = params.map(i => String(i));
	keys = new Array();
	for (key in params) {
		if (key !== undefined) {
			keys.push(`${key}=${params[key]}`);
		}
	}
	// console.log(`&${keys.join('&')}`);
	return `&${keys.join('&')}`;
}


class vk_api {
	constructor(data, api_version = '5.131', api_server = 'https://api.vk.com/', oauth_server = 'http://oauth.vk.com/') {
		// Getting api's version
		this.api_version = api_version;
		
		if (data.access_token !== undefined) {
			this.access_token = data.access_token;
			this.oauth_server = oauth_server;
		}
		else if (data.login !== undefined & data.password !== undefined){
			let auth = request('GET', `${oauth_server}token?grant_type=password&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH&username=${data.login}&password=${data.password}`);
			if (auth.statusCode != 200) {
				throw new vkApi_exception("Failed to connect to this vk api's server", 1, []);
			}
			else {
				let json_data = JSON.parse(auth.getBody().toString());
				if (json_data.error !== undefined) {
					throw new vkApi_exception(json_data.error_description, 1, {
						error: json_data.error,
						error_description: json_data.error_description,
						error_type: json_data.error_type
					});
				}
				else {
					this.access_token = json_data.access_token;
					// this.user_id = json_data.user_id;
				}
			}
		}
		else throw new vkApi_exception("Auth's data not getted", 1, [])
		
		try {
			let xhr = request('GET', `${api_server}method/utils.getServerTime?v=${this.api_version}&access_token=${this.access_token}`);
			if (xhr.statusCode == 200) {
				let json_data = JSON.parse(xhr.getBody().toString());
				if(json_data.response !== undefined){
					this.api_server = api_server;
				}
				else throw new Error("auth_fail")
			}
			else throw new Error("this exception will be catched :)")
		}
		catch (err) {
			console.log(err.message);
			if (err.message !== "auth_fail") throw new vkApi_exception("Failed to connect to this vk api's server", 1, []);
			else throw new vkApi_exception("Invalid auth data", 1, []);
		}
	}
	
	api(method, data = {}, debug = false) {
		let response = request('GET', `${this.api_server}method/${method}?v=${this.api_version}&access_token=${this.access_token}`, {qs: data});
		if (debug) console.log("DEBUG REQUEST >>", `${this.api_server}method/${method}?v=${this.api_version}&access_token=${this.access_token}`, {qs: data});
		// console.log(data);
		// let response = request('POST', `${this.api_server}method/${method}?v=${this.api_version}&access_token=${this.access_token}`, {
			// json : data
		// });
		if (response.statusCode == 200) {
			let json_data = JSON.parse(response.getBody().toString());
			// console.log(json_data);
			if(json_data.response !== undefined){
				return json_data.response;
			}
			else throw new vkApi_exception(json_data.error.error_msg, json_data.error.error_code, json_data.error.request_params);
		}
		else throw new vkApi_exception("Failed to connect to this vk api's server", response.statusCode, []);
		// else throw new vkApi_exception("Failed to connect to this vk api's server", 1, []);
	}
	
	uploadDoc (filename, content, mimetype, peer_id = undefined) {
		const boundaryId = Math.round((Math.random() * 89999999999) + 10000000000);
		const boundary = `vk-api-js-lin-separator--${boundaryId}`;
		
		let uploadServerUrl = this.api('docs.getMessagesUploadServer', {
			type : 'doc',
			peer_id
		}).upload_url;
		let body = `--${boundary}
Content-Disposition: form-data; name="file"; filename="${filename}"
Content-Type: ${mimetype}

`;
		body = Buffer.concat([Buffer.from(body), Buffer.from(content), Buffer.from(`\n--${boundary}--`)]);
		
		let saveStringFile = JSON.parse(req("POST", uploadServerUrl, {
			headers : {
				"content-type"   : `multipart/form-data; boundary=${boundary}`,
				"content-length" : body.length
			},
			body
		}).getBody().toString());
		// let resultUpload = {};
		if (!saveStringFile?.error) {
			return vk.api('docs.save', {
				file : saveStringFile.file
			});
		}
		else {
			// console.log(saveStringFile);
			throw new vkApi_exception(saveStringFile.error, 400, []);
		}
	}
	
	exec (code) {
		// code = "return [[], []];"
		
		const boundaryId = Math.round((Math.random() * 89999999999) + 10000000000);
		const boundary = `vk-api-js-lin-separator--${boundaryId}`;
		const body = Buffer.from(`--${boundary}
Content-Disposition: form-data; name="v";

${this.api_version}
--${boundary}
Content-Disposition: form-data; name="access_token";

${this.access_token}
--${boundary}
Content-Disposition: form-data; name="code";

${code}
--${boundary}--`);
		// console.log(body.toString());
		let response = request('POST', `${this.api_server}method/execute?v=${this.api_version}&access_token=${this.access_token}`, {
			// qs : {code}
			headers : {
				"content-type"   : `multipart/form-data; boundary=${boundary}`,
				"content-length" : Buffer.from(body).length
			},
			body
		});
		if (response.statusCode == 200) {
			let json_data = JSON.parse(response.getBody().toString());
			// console.log(json_data);
			if(json_data.response !== undefined){
				return json_data.response;
			}
			else throw new vkApi_exception(json_data.error.error_msg, json_data.error.error_code, json_data.error.request_params);
		}
		else throw new vkApi_exception("Failed to connect to this vk api's server", response.statusCode, []);
	}
}

module.exports = {
    VkApiError: vkApi_exception,
    VkApi: vk_api
}