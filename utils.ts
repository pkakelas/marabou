export const JSONParse = (str: string): object => {
	try {
		return JSON.parse(str)
	} catch (e) {
		return undefined
	}
}
