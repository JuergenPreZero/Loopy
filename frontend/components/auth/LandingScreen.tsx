import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

const DESIGN_COLORS = {
  vibrantGreen: '#AFE196',
  darkPurple: '#563D6D',
  darkPurpleDeep: '#3F2B52',
  vibrantRed: '#E84249',
  white: '#FFFFFF',
};

const FONTS = {
  semibold: 'outfit-semibold',
  bold: 'outfit-bold',
};

interface LandingScreenProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export default function LandingScreen({
  onNavigateLogin,
  onNavigateRegister,
}: LandingScreenProps) {
  const { height: windowHeight } = useWindowDimensions();
  const initialHeroHeight = React.useRef(windowHeight * 0.59).current;

  return (
    <View style={styles.container}>
      <View style={[styles.purpleBackdrop, { height: initialHeroHeight }]} />
      <View style={styles.accentOrbTopRight} />

      <View style={[styles.heroSection, { height: initialHeroHeight }]}>
        <View style={styles.topBubbleGroup}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>Hi! Schön, dass du da bist!</Text>
          </View>
          <View style={[styles.pointerDown, styles.pointerDownRight]} />
        </View>

        <View style={styles.logoRow}>
          <Image
            source={require('../../assets/Loopy_Logo_Green_3C_Happy.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomBubbleGroup}>
          <View style={[styles.pointerUp, styles.pointerUpLeft]} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>Weil wegwerfen Müll ist!</Text>
          </View>
        </View>
      </View>

      <View style={styles.greenActionZone}>
        <View pointerEvents="none" style={styles.accentOrbBottomLeft} />

        <View style={styles.ctaGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNavigateRegister}
            activeOpacity={0.86}
          >
            <Text style={styles.primaryButtonText}>Konto erstellen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onNavigateLogin}
            activeOpacity={0.86}
          >
            <Text style={styles.secondaryButtonText}>
              Ich habe schon ein Konto
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.vibrantGreen,
    overflow: 'hidden',
  },
  purpleBackdrop: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    backgroundColor: DESIGN_COLORS.darkPurple,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 2,
  },
  accentOrbTopRight: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(175, 225, 150, 0.08)',
    zIndex: 3,
  },
  heroSection: {
    justifyContent: 'center',
    paddingTop: 34,
    paddingHorizontal: 22,
    zIndex: 4,
  },
  topBubbleGroup: {
    alignSelf: 'flex-start',
    marginLeft: 6,
    marginBottom: 4,
  },
  logoRow: {
    alignSelf: 'center',
    marginLeft: 18,
  },
  logo: {
    width: 296,
    height: 146,
  },
  bottomBubbleGroup: {
    alignSelf: 'flex-end',
    marginRight: 4,
    marginTop: 2,
  },
  speechBubble: {
    backgroundColor: DESIGN_COLORS.vibrantRed,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 18,
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  speechText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 20,
    color: DESIGN_COLORS.white,
  },
  pointerDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: DESIGN_COLORS.vibrantRed,
    marginTop: -1,
  },
  pointerDownRight: {
    alignSelf: 'flex-end',
    marginRight: 26,
  },
  pointerUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: DESIGN_COLORS.vibrantRed,
    marginBottom: -1,
  },
  pointerUpLeft: {
    alignSelf: 'flex-start',
    marginLeft: 26,
  },
  greenActionZone: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    overflow: 'hidden', 
    zIndex: 1,
  },
  accentOrbBottomLeft: {
    position: 'absolute',
    top: 70, 
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  ctaGroup: {
    width: '100%',
    gap: 12,
    zIndex: 2, 
  },
  primaryButton: {
    backgroundColor: DESIGN_COLORS.darkPurple,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    color: DESIGN_COLORS.white,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: DESIGN_COLORS.white,
    borderColor: 'rgba(86, 61, 109, 0.28)',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontFamily: FONTS.semibold,
    color: DESIGN_COLORS.darkPurple,
    fontSize: 15.5,
  },
});