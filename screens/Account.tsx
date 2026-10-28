// Account tab: editable profile, photo, notification switches, settings, shop menu.
import React, { useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useShop } from '../store';
import { COLORS, MenuRow, Screen } from '../ui';

export default function Account() {
  const nav = useNavigation<any>();
  const { profile, saveProfile, prefs, savePrefs, cartCount, wishlist, orders } = useShop();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [saved, setSaved] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to set a profile picture.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      saveProfile({ name, email, phone, address, avatarUri: res.assets[0].uri });
      Alert.alert('Photo updated', 'Your profile picture was saved.');
    }
  };

  const save = () => {
    if (name.trim().length < 2) { Alert.alert('Invalid name', 'Please enter your full name.'); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) { Alert.alert('Invalid email', 'Please enter a valid email address.'); return; }
    saveProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), avatarUri: profile.avatarUri });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: 'orderUpdates' | 'offers' | 'newsletter' | 'darkMode' | 'adminMode') =>
    savePrefs({ ...prefs, [key]: !prefs[key] });

  const prefRow = (key: 'orderUpdates' | 'offers' | 'newsletter', title: string, sub: string, color?: string) => (
    <View key={key} style={s.switchRow}>
      <View style={s.switchMid}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      <Switch value={prefs[key]} onValueChange={() => toggle(key)} trackColor={{ false: '#D1D5DB', true: color ?? COLORS.primary }} />
    </View>
  );

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" style={prefs.darkMode && s.tinted}>
        <View style={s.card}>
          <View style={s.avatarRow}>
            <Image
              source={profile.avatarUri ? { uri: profile.avatarUri } : require('../assets/images/avatar-placeholder.png')}
              style={s.avatar}
            />
            <View style={s.avatarBtns}>
              <Button title="Change Photo" onPress={pickImage} color={COLORS.primary} />
              {profile.avatarUri && (
                <View style={s.gap}>
                  <Button title="Remove" onPress={() => saveProfile({ ...profile, avatarUri: null })} color="#9CA3AF" />
                </View>
              )}
            </View>
          </View>

          <Text style={s.label}>Full name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#9CA3AF" style={s.input} />
          <Text style={s.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address"
            autoCapitalize="none" placeholderTextColor="#9CA3AF" style={s.input} />
          <Text style={s.label}>Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="10-digit mobile" keyboardType="phone-pad" placeholderTextColor="#9CA3AF" style={s.input} />
          <Text style={s.label}>Default address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="Used to prefill checkout" multiline
            placeholderTextColor="#9CA3AF" style={[s.input, s.multi]} />

          <Button title={saved ? '✓ Saved!' : 'Save Profile'} onPress={save} color={COLORS.primary} />

          <View style={s.stats}>
            <View style={s.stat}><Text style={s.statNum}>{cartCount}</Text><Text style={s.statLabel}>In cart</Text></View>
            <View style={s.stat}><Text style={s.statNum}>{wishlist.length}</Text><Text style={s.statLabel}>Wishlist</Text></View>
            <View style={s.stat}><Text style={s.statNum}>{orders.length}</Text><Text style={s.statLabel}>Orders</Text></View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.h}>Notification Preferences (demo)</Text>
          <Text style={s.demoNote}>These switches are stored on this device only — the app sends no push notifications or emails.</Text>
          {prefRow('orderUpdates', 'Order updates', 'In-app demo reminders for your orders')}
          {prefRow('offers', 'Offers & sales', 'Demo coupon alerts inside the app')}
          {prefRow('newsletter', 'Newsletter', 'Demo digest preference (no emails sent)')}
        </View>

        <View style={s.card}>
          <Text style={s.h}>Settings</Text>
          <View style={s.switchRow}>
            <View style={s.switchMid}>
              <Text style={s.rowTitle}>🛠️ Demo Admin Mode</Text>
              <Text style={s.rowSub}>Unlocks product & order management</Text>
            </View>
            <Switch value={prefs.adminMode} onValueChange={() => toggle('adminMode')} trackColor={{ false: '#D1D5DB', true: COLORS.warning }} />
          </View>
          <View style={s.switchRow}>
            <View style={s.switchMid}>
              <Text style={s.rowTitle}>🌙 Dark screen tint</Text>
              <Text style={s.rowSub}>Demo theme preference</Text>
            </View>
            <Switch value={prefs.darkMode} onValueChange={() => toggle('darkMode')} trackColor={{ false: '#D1D5DB', true: '#111827' }} />
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.h}>My ShopSphere</Text>
          <MenuRow title="My Orders" sub={`${orders.length} order(s) · tracking included`} icon="📦" onPress={() => nav.navigate('Orders')} />
          {prefs.adminMode && (
            <MenuRow title="Admin Dashboard" sub="Products, orders & sales stats" icon="🛠️" onPress={() => nav.navigate('Admin')} />
          )}
          <MenuRow title="About ShopSphere" sub="What this demo app is" icon="🏬" onPress={() => nav.navigate('About')} />
          <MenuRow title="Help & Support" sub="Demo form, saved on this device" icon="💬" onPress={() => nav.navigate('Contact')} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  tinted: { backgroundColor: '#E8EAF6' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primarySoft },
  avatarBtns: { marginLeft: 14, flex: 1 },
  gap: { marginTop: 6 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, backgroundColor: '#fff' },
  multi: { minHeight: 64, textAlignVertical: 'top' },
  stats: { flexDirection: 'row', marginTop: 14, backgroundColor: COLORS.primarySoft, borderRadius: 10, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  statLabel: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  h: { fontWeight: '800', fontSize: 15.5, color: COLORS.text, marginBottom: 6 },
  demoNote: { fontSize: 12.5, color: COLORS.muted, marginBottom: 4, lineHeight: 18 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#F1F2F6' },
  switchMid: { flex: 1, paddingRight: 10 },
  rowTitle: { fontWeight: '700', fontSize: 14, color: COLORS.text },
  rowSub: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
});
