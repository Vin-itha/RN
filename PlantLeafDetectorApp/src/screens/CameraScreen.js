import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(colors.primaryDark);
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        let storagePermission;
        if (Platform.Version >= 33) {
          storagePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        } else {
          storagePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

        if (cameraPermission && storagePermission) {
          setHasPermission(true);
        } else {
          requestPermissions();
        }
      } else {
        const cameraResult = await check(PERMISSIONS.IOS.CAMERA);
        const photoResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

        if (cameraResult === RESULTS.GRANTED && photoResult === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          requestPermissions();
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        let permissionsToRequest = [PermissionsAndroid.PERMISSIONS.CAMERA];

        if (Platform.Version >= 33) {
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
        }

        const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

        const allPermissionsGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        setHasPermission(allPermissionsGranted);

        if (!allPermissionsGranted) {
          Alert.alert(
            'Permissions Required',
            'Camera and storage permissions are required to use this feature.',
            [{ text: 'OK' }]
          );
        }
      } else {
        const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
        const photoResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

        const granted =
          cameraResult === RESULTS.GRANTED && photoResult === RESULTS.GRANTED;
        setHasPermission(granted);

        if (!granted) {
          Alert.alert(
            'Permissions Required',
            'Camera and photo library permissions are required to use this feature.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const handleImagePicked = (response) => {
    if (response.didCancel || response.error) {
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];

      navigation.navigate('DetectionResults', {
        imageUri: asset.uri,
        imagePath: asset.uri,
        fileName: asset.fileName || 'captured_leaf.jpg',
        fileSize: asset.fileSize,
        imageWidth: asset.width,
        imageHeight: asset.height,
      });
    }
  };

  const openCamera = () => {
    if (!hasPermission) {
      requestPermissions();
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      saveToPhotos: true,
    };

    launchCamera(options, handleImagePicked);
  };

  const openImageLibrary = () => {
    if (!hasPermission) {
      requestPermissions();
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, handleImagePicked);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryVariant]}
        style={styles.header}
      >
        <TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.goBack()}
  activeOpacity={0.8}
>
  <Text style={styles.backEmoji}>{'✕'}</Text>
</TouchableOpacity>


        <Text style={styles.headerTitle}>Capture Leaf</Text>

        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Instruction Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          duration={800}
          style={styles.instructionSection}
        >
          <View style={styles.instructionIcon}>
            <Text style={styles.instructionEmoji}>🌿</Text>
          </View>

          <Text style={styles.instructionTitle}>
            🌿 Ready to Identify Your Plant Leaf?
          </Text>
        </Animatable.View>
      </View>

      {/* Bottom Action Buttons */}
      <Animatable.View
        animation="slideInUp"
        delay={900}
        duration={600}
        style={styles.bottomActions}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={openCamera}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryVariant]}
                style={styles.actionButtonGradient}
              >
                <Icon name="camera-alt" size={24} color={colors.textOnPrimary} />
                <Text style={styles.primaryActionText}>Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={openImageLibrary}
              activeOpacity={0.8}
            >
              <Icon name="photo-library" size={24} color={colors.primary} />
              <Text style={styles.secondaryActionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="help-outline" size={20} color={colors.secondary} />
              <Text style={styles.helpButtonText}>Need help identifying plants?</Text>
            </TouchableOpacity>
          </>
        )}
      </Animatable.View>

      {/* Help Modal */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tips for Best Results</Text>
            <Text style={styles.modalSubtitle}>
              For the best results, please ensure your leaf image has:
            </Text>

            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.tipText}>💡 Good lighting and clear visibility</Text>
              </View>

              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.tipText}>📸 Leaf fills most of the image frame</Text>
              </View>

              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.tipText}>🌱 Minimal background distractions</Text>
              </View>

              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.tipText}>🔍 Leaf is in focus and not blurry</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setHelpVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    elevation: 4,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
  padding: spacing.sm,
  borderRadius: 30,
  backgroundColor: 'rgba(255, 255, 255, 0.35)',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
  elevation: 3,
},
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.textOnPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  instructionSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  instructionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  instructionEmoji: {
    fontSize: 56,
    textAlign: 'center',
  },
  instructionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  bottomActions: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    elevation: 8,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  primaryActionButton: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  primaryActionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.textOnPrimary,
    marginLeft: spacing.sm,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  secondaryActionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  helpButtonText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginLeft: spacing.xs,
    textDecorationLine: 'underline',
  },
  tipsList: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 5,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  modalCloseText: {
    fontSize: fontSize.md,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.semiBold,
  },
});

export default CameraScreen;
