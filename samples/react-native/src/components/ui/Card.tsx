import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'bordered' | 'shadow' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

/**
 * Flexible Card component for content organization
 * Built with React Native StyleSheet design system
 * 
 * @example
 * <Card 
 *   title="Product Info" 
 *   variant="shadow" 
 *   padding="lg"
 * >
 *   <Text>Product details here</Text>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[padding],
    style,
  ];

  const hasHeader = title || subtitle;

  return (
    <View style={cardStyles}>
      {hasHeader && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, titleStyle]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      <View style={hasHeader ? styles.content : undefined}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bordered: {
    borderWidth: 2,
    borderColor: '#C7C7CC',
  },
  shadow: {
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  sm: {
    padding: 12,
  },
  md: {
    padding: 16,
  },
  lg: {
    padding: 24,
  },
  
  // Header and content
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 12,
    marginBottom: 16,
  },
  
  content: {
    // Content spacing is handled by header margin
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 24,
  },
  
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 20,
  },
});