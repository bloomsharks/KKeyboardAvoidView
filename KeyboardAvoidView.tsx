import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  UIManager,
  Platform,
  View,
  LayoutAnimation,
} from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  container: {
    flex: 1,
  },
});

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
// * ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
// ? START ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !

const KeyboardAvoidView = props => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [scaled, setScaled] = useState(true);

  const AnimationType = 'scaleSpring';
  const DEBUG = false;

  const animationConfigs = new Map([
    [
      AnimationType,
      {
        duration: Platform.select({ios: 600, android: 700}),
        update: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: Platform.select({ios: 2, android: 2}),
        },
      },
    ],
  ]);

  const _animate = useCallback(
    event => {
      const keybAddVal = Platform.select({ios: 0, android: 0});
      const keybHeight =
        event.action === 'show' ? event.endCoordinates.height + keybAddVal : 0;

      setKeyboardHeight(keybHeight);
      setKeyboardVisible(event.action === 'show');
      setScaled(false);

      if (DEBUG) {
        console.log('\n');
        console.log('KeyboardAvoidView Animation START 🏁');
        console.log(
          'Keyboard ⌨️ ',
          'height:',
          keybHeight,
          'setVisibility:',
          event.action === 'show',
          'scaled:',
          false,
        );
      }

      LayoutAnimation.configureNext(animationConfigs.get(AnimationType), () => {
        setScaled(true);
        if (DEBUG) {
          console.log('scaled 🎚️ ', true);
          console.log('KeyboardAvoidView Animation END ⌛');
        }
      });
    },
    [DEBUG, animationConfigs],
  );

  useEffect(() => {
    let keyboardWillShowListener = null;
    let keyboardWillHideListener = null;
    let keyboardDidShowListener = null;
    let keyboardDidHideListener = null;

    if (Platform.OS === 'ios') {
      keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        evt => {
          const event = {...evt, action: 'show'};
          _animate(event);
        },
      );

      keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        evt => {
          const event = {...evt, action: 'hide'};
          _animate(event);
        },
      );
    } else if (Platform.OS === 'android') {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', evt => {
        const event = {...evt, action: 'show'};
        _animate(event);
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', evt => {
        const event = {...evt, action: 'hide'};
        _animate(event);
      });
    }

    return () => {
      if (Platform.OS === 'ios') {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      } else if (Platform.OS === 'android') {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      }
    };
  }, []);

  const {children} = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <View {...props} style={styles.wrapper}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (keyboardVisible) Keyboard.dismiss();
        }}
        accessible={false}>
        <View style={styles.container}>
          {children}
          <View style={{marginBottom: keyboardHeight}} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default KeyboardAvoidView;
