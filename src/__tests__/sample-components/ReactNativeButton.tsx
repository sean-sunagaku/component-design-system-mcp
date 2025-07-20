
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

/**
 * React Native Button Component
 * 
 * @example
 * <Button 
 *   title="Click me" 
 *   onPress={handlePress}
 *   variant="primary"
 *   size="medium"
 * />
 */
const StyleSheet = {
  create: (styles: any) => styles
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false
}: ButtonProps) => {
  return null; // TouchableOpacity with Text child
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});
