import React from 'react';
import { Text } from 'react-native';

const SafeText = ({ children, style, numberOfLines, ...otherProps }) => {
  return (
    <Text 
      style={style} 
      numberOfLines={numberOfLines}
      {...otherProps}
    >
      {children}
    </Text>
  );
};

export default SafeText;