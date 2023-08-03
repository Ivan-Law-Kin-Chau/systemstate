import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import PEG from "pegjs";

import Main from "./main.jsx";

const App = () => {
	const [tokenizer, setTokenizer] = React.useState(null);
	
	React.useEffect(() => {
		fetch(`/tokenizer.pegjs`)
			.then(response => response.text())
			.then(tokenizer => setTokenizer(PEG.generate(tokenizer)));
	}, []);
	
	return tokenizer === null ? `` : <Main tokenizer={tokenizer}/>;
}

const root = ReactDOMClient.createRoot(document.getElementById("app"));
root.render(<App/>);