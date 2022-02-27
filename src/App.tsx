import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { NotFound } from "./components/NotFound";
import { About } from "./pages/About";
import { Get } from "./pages/Get";
import { Send } from "./pages/Send";

import "./App.css";

// polyfill TransformStream if it's missing
if (typeof TransformStream === "undefined") {
  import("web-streams-polyfill/es6");
}

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Send />} />
          <Route path="/get" element={<Get />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
