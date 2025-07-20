import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from 'react-native';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  data?: any;
}

export interface ListProps {
  data: ListItem[];
  variant?: 'default' | 'bordered' | 'divided' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  showAvatars?: boolean;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  emptyComponent?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/**
 * Flexible List component for displaying structured data
 * Built with React Native FlatList for performance
 * 
 * @example
 * <List 
 *   data={userList}
 *   variant="cards"
 *   size="md"
 *   showAvatars
 *   onRefresh={handleRefresh}
 * />
 */
export const List: React.FC<ListProps> = ({
  data,
  variant = 'default',
  size = 'md',
  showAvatars = false,
  style,
  itemStyle,
  emptyComponent,
  onRefresh,
  refreshing = false,
}) => {
  const renderEmptyComponent = () => {
    if (emptyComponent) {
      return emptyComponent;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>No items to display</Text>
      </View>
    );
  };

  const renderListItem: ListRenderItem<ListItem> = ({ item, index }) => {
    const itemStyles = [
      styles.itemBase,
      styles[variant],
      styles[size],
      variant === 'cards' && styles.cardItem,
      variant === 'divided' && index !== data.length - 1 && styles.dividedItem,
      itemStyle,
    ];

    const content = (
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          {showAvatars && (
            <View style={styles.avatarContainer}>
              {item.avatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.title.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        {item.rightContent && (
          <View style={styles.rightContent}>
            {item.rightContent}
          </View>
        )}
      </View>
    );

    if (item.onPress) {
      return (
        <TouchableOpacity
          style={itemStyles}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View style={itemStyles}>
        {content}
      </View>
    );
  };

  const containerStyles = [
    styles.container,
    variant === 'bordered' && styles.borderedContainer,
    style,
  ];

  return (
    <FlatList
      data={data}
      renderItem={renderListItem}
      keyExtractor={(item) => item.id}
      style={containerStyles}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ItemSeparatorComponent={
        variant === 'cards' 
          ? () => <View style={styles.cardSeparator} />
          : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  borderedContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  // Item base styles
  itemBase: {
    backgroundColor: '#FFFFFF',
  },
  
  // Variant styles
  default: {
    // Default styling handled by base
  },
  
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  divided: {
    // Divider added conditionally via dividedItem
  },
  
  cards: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  cardItem: {
    borderRadius: 8,
  },
  
  dividedItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  cardSeparator: {
    height: 12,
  },
  
  // Size styles
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 72,
  },
  
  // Content layout
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  
  avatarContainer: {
    marginRight: 12,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 22,
  },
  
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 20,
  },
  
  description: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 16,
  },
  
  rightContent: {
    marginLeft: 12,
    alignItems: 'center',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});