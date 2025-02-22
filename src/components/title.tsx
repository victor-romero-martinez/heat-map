import React from "react";

interface TitleProps {
  type: "h1" | "h2" | "h3";
  text: string;
  id: string;
}

export default function Title({ type, text, id }: TitleProps) {
  return React.createElement(type, { id }, text);
}
