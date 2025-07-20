import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable Button component with multiple variants and sizes
 * Built with React Native StyleSheet for consistent design system
 * 
 * @example
 * <Button 
 *   title="Click me"
 *   variant="primary" 
 *   size="md" 
 *   onPress={handlePress}
 * />
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'success' || variant === 'danger' ? '#FFFFFF' : '#007AFF'}
          style={styles.loadingIndicator}
        />
      )}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  
  // Variants
  primary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderColor: '#C7C7CC',
  },
  success: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  warning: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  danger: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 52,
  },
  xl: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    minHeight: 60,
  },
  
  // Modifiers
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  successText: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  ghostText: {
    color: '#007AFF',
  },
  
  // Size text
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  xlText: {
    fontSize: 20,
  },
  
  loadingIndicator: {
    marginRight: 8,
  },
});