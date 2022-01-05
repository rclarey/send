import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Get } from "./Get";
import { Layout } from "./Layout";
import { MakeRequest } from "./MakeRequest";
import { NotFound } from "./NotFound";
import { ReceiveRequest } from "./ReceiveRequest";
import { Send } from "./Send";

import "./App.css";

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Send />} />
          <Route path="/get" element={<Get />} />
          <Route path="/make-request" element={<MakeRequest />} />
          <Route path="/request" element={<ReceiveRequest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
