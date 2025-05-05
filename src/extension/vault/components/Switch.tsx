import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import '../css/switch.css';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  thumbColor?: string;
  activeFillColor?: string;
  inactiveFillColor?: string;
  duration?: number;
  size?: number; // New prop for switch size
  onPress?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  id = 'Switch',
  checked = false,
  thumbColor = '#fff',
  activeFillColor = '#4cd964',
  inactiveFillColor = '#dcdcdc',
  duration = 250,
  size = 40, // Default size (width of the switch)
  onPress,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const styles = useSpring({
    translateX: isChecked ? size / 2 : 2, // Adjust the thumb position dynamically
    backgroundColor: isChecked ? activeFillColor : inactiveFillColor,
    config: { duration },
  });

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onPress?.(newChecked);
  }, [isChecked, onPress, disabled]);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const height = size / 2; // Height is half of the width for an oval shape
  const thumbSize = height - 4; // Thumb size slightly smaller than the height

  return (
    <animated.div
      id={id}
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      className={`switch-container ${disabled ? 'disabled' : ''}`}
      style={{
        backgroundColor: styles.backgroundColor, // Animated background color
        pointerEvents: disabled ? 'none' : 'auto',
        width: size,
        height: height,
        borderRadius: height / 2,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <animated.div
        className="switch-thumb"
        style={{
          transform: styles.translateX.to((x) => `translateX(${x}px)`),
          width: thumbSize,
          height: thumbSize,
          backgroundColor: thumbColor,
          borderRadius: '50%',
          position: 'absolute',
          top: 2,
        }}
      />
    </animated.div>
  );
};

export default Switch;
