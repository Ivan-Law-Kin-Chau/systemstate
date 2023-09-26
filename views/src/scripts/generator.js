export function generateKey () {
	var key = "";
	
	for (let i = 0; i < 8; i++) {
		key += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36));
	}
	
	return key;
}