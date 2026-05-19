import type { Config } from "tailwindcss";
const config: Config = { content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"], theme:{extend:{colors:{papel:{blue:"#004a99",navy:"#022f61",gold:"#ffd700",red:"#e53e3e",green:"#16a34a",bg:"#f8f9fa"}},boxShadow:{premium:"0 18px 55px rgba(0,45,110,.12)"}}}, plugins:[]};
export default config;
