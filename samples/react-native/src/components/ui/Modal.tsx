import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ViewStyle,
  ModalProps as RNModalProps,
} from 'react-native';

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
}

/**
 * Modal component with overlay and customizable sizing
 * Built with React Native Modal for native platform support
 * 
 * @example
 * <Modal 
 *   isVisible={isModalVisible} 
 *   onClose={() => setIsModalVisible(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <Text>Are you sure you want to proceed?</Text>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  scrollable = true,
  style,
  contentStyle,
  headerStyle,
  ...props
}) => {
  const { width, height } = Dimensions.get('window');
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: Math.min(width * 0.8, 300),
          maxHeight: height * 0.5,
        };
      case 'md':
        return {
          width: Math.min(width * 0.9, 400),
          maxHeight: height * 0.7,
        };
      case 'lg':
        return {
          width: Math.min(width * 0.95, 600),
          maxHeight: height * 0.8,
        };
      case 'full':
        return {
          width: width * 0.95,
          height: height * 0.9,
        };
      default:
        return {
          width: Math.min(width * 0.9, 400),
          maxHeight: height * 0.7,
        };
    }
  };

  const modalContentStyles = [
    styles.modalContent,
    getSizeStyles(),
    contentStyle,
  ];

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable 
    ? { showsVerticalScrollIndicator: false, bounces: false }
    : {};

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <View style={[styles.modalContainer, style]}>
            <TouchableOpacity
              style={modalContentStyles}
              activeOpacity={1}
              onPress={() => {}}
            >
              {(title || showCloseButton) && (
                <View style={[styles.header, headerStyle]}>
                  {title && (
                    <Text style={styles.title}>
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              <ContentWrapper
                style={styles.body}
                {...contentWrapperProps}
              >
                {children}
              </ContentWrapper>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#8E8E93',
    lineHeight: 24,
  },
  
  body: {
    padding: 20,
  },
});