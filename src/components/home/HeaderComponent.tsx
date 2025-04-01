import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface HeaderComponentProps {
  userName: string;
  userAvatar?: string;
  onAvatarPress: () => void;
  onNotificationsPress: () => void;
  isDarkMode: boolean;
  currentDate: string;
  fadeAnim?: Animated.Value;
  slideAnim?: Animated.Value;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  userName,
  userAvatar,
  onAvatarPress,
  onNotificationsPress,
  isDarkMode,
  currentDate,
  fadeAnim = new Animated.Value(1),
  slideAnim = new Animated.Value(0),
}) => {
  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onAvatarPress}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: isDarkMode ? '#2D2A55' : '#E0E0FF' },
              ]}
            >
              <Text
                style={{
                  color: isDarkMode ? '#9DADF2' : '#5142AB',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text
            style={[
              styles.welcomeText,
              { color: isDarkMode ? '#9DADF2' : '#464A54' },
            ]}
          >
            Olá,
          </Text>
          <Text
            style={[
              styles.userName,
              { color: isDarkMode ? '#FFFFFF' : '#000000' },
            ]}
          >
            {userName}
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationsPress}
        >
          <Icon
            name="bell-outline"
            size={24}
            color={isDarkMode ? '#9DADF2' : '#464A54'}
          />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 