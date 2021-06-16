export const JSONBuffParse = (buff: Buffer): object => {
	try {
		const str = String(buff)
		return JSON.parse(str)
	} catch (e) {
		return undefined
	}
}