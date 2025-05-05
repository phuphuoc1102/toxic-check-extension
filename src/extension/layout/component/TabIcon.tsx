import React from "react";

type Props = {
  icon: string; // Assuming `icon` is a URL for a web image
  color: string;
  focused: boolean;
};

const TabIcon: React.FC<Props> = ({ icon, color, focused }) => {
  return (
    <div style={styles.container}>
      <img
        src={icon}
        style={{
          width: 20,
          height: 20,
          filter: `invert(${color === '#2384F7' ? 29 : 0}%) sepia(${color === '#2384F7' ? 76 : 0}%) saturate(${color === '#2384F7' ? 748 : 0}%) hue-rotate(${color === '#2384F7' ? 176 : 0}deg) brightness(${color === '#2384F7' ? 95 : 100}%) contrast(${color === '#2384F7' ? 92 : 100}%)`,
        }}
      />
      <div style={{ width: "100%", textAlign: "center" }}>
        
      </div>
    </div>
  );
};

export default TabIcon;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
};
