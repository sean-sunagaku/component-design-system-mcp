import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  variant?: 'default' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Versatile Input component with multiple variants
 * Includes label, helper text, and error state support
 * 
 * @example
 * <Input 
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  defaultValue,
  variant = 'default',
  size = 'md',
  disabled = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyles = [
    styles.input,
    styles[`${size}Input` as keyof typeof styles],
    {
      paddingLeft: leftIcon ? 40 : undefined,
      paddingRight: rightIcon ? 40 : undefined,
    },
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          error && styles.errorLabel,
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyles}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          editable={!disabled}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#8E8E93"
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  
  errorLabel: {
    color: '#FF3B30',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  filled: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  underlined: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#C7C7CC',
    borderRadius: 0,
  },
  
  // Sizes
  sm: {
    minHeight: 36,
  },
  md: {
    minHeight: 44,
  },
  lg: {
    minHeight: 52,
  },
  
  // States
  focused: {
    borderColor: '#007AFF',
  },
  error: {
    borderColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#F2F2F7',
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
  },
  
  // Size-specific input styles
  smInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mdInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lgInput: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  
  // Icons
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 6,
  },
  
  errorText: {
    color: '#FF3B30',
  },
});