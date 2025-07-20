import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'transparent';
  showBorder?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

/**
 * Page Header component with title, subtitle and actions
 * Built with React Native SafeAreaView for proper spacing
 * 
 * @example
 * <Header 
 *   title="Dashboard" 
 *   subtitle="Welcome back!"
 *   variant="gradient"
 *   showBorder
 * >
 *   <Button variant="primary" title="Action" />
 * </Header>
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  showBorder = true,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const containerStyles = [
    styles.container,
    styles[variant],
    showBorder && variant !== 'transparent' && styles.bordered,
    style,
  ];

  const titleStyles = [
    styles.title,
    styles[`${variant}Title` as keyof typeof styles],
    titleStyle,
  ];

  const subtitleStyles = [
    styles.subtitle,
    styles[`${variant}Subtitle` as keyof typeof styles],
    subtitleStyle,
  ];

  return (
    <SafeAreaView style={containerStyles}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {title && (
            <Text style={titleStyles}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={subtitleStyles}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {children && (
          <View style={styles.actionsContainer}>
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // Variants
  default: {
    backgroundColor: '#FFFFFF',
  },
  
  gradient: {
    backgroundColor: '#007AFF',
  },
  
  transparent: {
    backgroundColor: 'transparent',
  },
  
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  
  // Variant-specific text styles
  defaultTitle: {
    color: '#1C1C1E',
  },
  
  defaultSubtitle: {
    color: '#8E8E93',
  },
  
  gradientTitle: {
    color: '#FFFFFF',
  },
  
  gradientSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  transparentTitle: {
    color: '#1C1C1E',
  },
  
  transparentSubtitle: {
    color: '#8E8E93',
  },
  
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
});