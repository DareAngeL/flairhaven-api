const jwt = require("jsonwebtoken")
const secret = "SVGE-CommerceAPI"

const generateAccessToken = (user) =>{

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
		isDesigner: user.isDesigner
	}
	//generate a JSON web token using the jwt's sign method
	//generate token using the data, and the secret with no additional options provided
	return jwt.sign(data,secret,{})

}

const verify = (req,res,next)=>{

	let token = req.headers.authorization

	if (typeof token !== "undefined"){
        token = token.slice(7,token.length)

		//validate the token using the "verify" method decrypting the token using the secret code
		return jwt.verify(token,secret,(err,data)=>{

			//if the JWT is not valid
			if (err){
				return res.send({auth:"failed"})
			}
			//JWT is valid
            //allows the app to proceed with the next middleware function in the route
            next()
		})
	}

	//token does not exist
    return res.send({auth:"failed"})
}

const decode = (token) => {

	// Token recieved and is not undefined
	if(typeof token !== "undefined"){

		// Retrieves only the token and removes the "Bearer " prefix
		token = token.slice(7, token.length)
		return jwt.verify(token, secret, (err, data) => {
			if (err) {
				return null
			}
            // The "decode" method is used to obtain the information from the JWT
            // The "{complete:true}" option allows us to return additional information from the JWT token
            // Returns an object with access to the "payload" property which contains user information stored when the token was generated
            // The payload contains information provided in the "createAccessToken" method defined above (e.g. id, email and isAdmin)
            return jwt.decode(token, {complete:true}).payload
		})

	// Token does not exist
	}

    return null
}

module.exports = {generateAccessToken, verify, decode}