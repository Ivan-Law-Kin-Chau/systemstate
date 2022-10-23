export async function listen (callbackFunction) {
	let printed = [];
	const print = output => {
		printed.push(output);
	}
	
	await callbackFunction(print);
	return printed;
}