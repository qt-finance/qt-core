module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: "all",
	printWidth: 100,
	arrowParens: "avoid",
	overrides: [
		{
			files: "*.sol",
			options: {
				printWidth: 100,
				tabWidth: 4,
				useTabs: true,
				singleQuote: true,
				bracketSpacing: true,
				explicitTypes: "always",
				compiler: "0.8.16",
			},
		},
	],
};
