/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        obold: ["OpenSans-Bold", "sans-serif"],
        oextrabold: ["OpenSans-ExtraBold", "sans-serif"],
        olight: ["OpenSans-Light", "sans-serif"],
        oregular: ["OpenSans-Regular", "sans-serif"],
        osemibold: ["OpenSans-SemiBold", "sans-serif"],
        omedium: ["OpenSans-Medium", "sans-serif"],
      },
      boxShadow: {
        content: "0px 4px 7px rgba(0, 0, 0, 0.1);",
        table: "0px 4px 7px rgb(0 0 0 / 10%)",
        blue_custom: "0 0 30px 10px #C4D4FE",
      },
      colors: {
        text: "#252F40",
        primary: "#2384F7",
        secondary: "#F0F4F7", // '#8392AB',
        tertiary: "#E8AE4C",

        black: "#252F40",
        white: "#FFFFFF",

        dark: "#252F40",
        light: "#e9ecef",

        gray: "#6B7280",

        danger: "#EA0606",
        warning: "#FFC107",
        success: "#82D616",
        info: "#2170CD",
        // info: '#17C1E8',

        card: "#FFFFFF",
        background: "#EEEEEE",

        shadow: "#000000",
        overlay: "rgba(0,0,0,0.3)",

        focus: "#2384F7",
        input: "#252F40",

        switchOn: "#2384F7",
        switchOff: "#C1C1C1",

        checkbox: ["#3A416F", "#141727"],
        checkboxIcon: "#FFFFFF",

        facebook: "#3B5998",
        twitter: "#55ACEE",
        dribbble: "#EA4C89",

        icon: "#A6A9AD",
        card_bg: "#E1E8F0",
        blurTint: "light",

        link: "#CB0C9F",
        square: "#e2e8f0",
        box: "#EEF0F2",
        button_active: "#377DFF",
        button_inactive: "#CBCBCB ",
      },
      fontWeight: {
        "extra-light": 200,
        light: 300,
        normal: 400,
        medium: 500,
        "semi-bold": 550,
        bold: 700,
        "extra-bold": 800,
        black: 900,
      },
    },
  },
  plugins: [],
};
