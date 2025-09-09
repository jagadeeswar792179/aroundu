import React from "react";

const Line = ({
  length = 100,
  size = 2,
  color = "black",
  transparency = 1,
  center = false,
  padding = 0,
}) => {
  const isVertical = length < 0;
  const lineLength = Math.abs(length);

  const lineStyle = {
    width: isVertical ? `${size}px` : `${lineLength}px`,
    height: isVertical ? `${lineLength}px` : `${size}px`,
    backgroundColor: color,
    opacity: transparency,
  };

  const containerStyle = {
    padding: `${padding}px`,
    display: center ? "flex" : "block",
    justifyContent: center ? "center" : "initial",
    alignItems: center ? "center" : "initial",
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
    </div>
  );
};

export default Line;
