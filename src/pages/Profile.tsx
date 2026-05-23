import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Mail, Calendar, Hash, Award, Edit3, User as UserIcon, Save, X, Camera, FileUp, Facebook, Phone, ExternalLink, AtSign, Loader2 } from "lucide-react";
import { useAuth, normalizePhone } from "@/src/hooks/useAuth";
import { doc, updateDoc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { UserProfile } from "@/src/types";
import { cn } from "@/src/lib/utils";

export const Profile = () => {
  const { uid: paramUid } = useParams();
  const { profile: loggedInProfile, user: currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const idFileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [editedProfile, setEditedProfile] = useState({
    displayName: "",
    bio: "",
    batch: "",
    session: "",
    skills: "",
    photoURL: "",
    facebookUrl: "",
    phoneNumber: "",
    customUsername: "",
    idCardUrl: "",
  });

  const isOwnProfile = !paramUid || paramUid === currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const targetUid = paramUid || currentUser?.uid;
      if (!targetUid) return;

      try {
        const userRef = doc(db, "users", targetUid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          setProfile(data);
          setEditedProfile({
            displayName: data.displayName || "",
            bio: data.bio || "",
            batch: data.batch || "",
            session: data.session || "",
            skills: data.skills?.join(", ") || "",
            photoURL: data.photoURL || "",
            facebookUrl: data.facebookUrl || "",
            phoneNumber: data.phoneNumber || "",
            customUsername: data.customUsername || "",
            idCardUrl: data.idCardUrl || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [paramUid, currentUser]);

  const handleSave = async () => {
    if (!profile) return;
    setError("");
    setIsSaving(true);

    try {
      // Check username uniqueness if changed
      if (editedProfile.customUsername && editedProfile.customUsername !== profile.customUsername) {
        const usernameRef = doc(db, "usernames", editedProfile.customUsername.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        if (usernameSnap.exists()) {
          setError("Username already taken. Please choose another one.");
          setIsSaving(false);
          return;
        }

        // Remove old username mapping if it existed
        if (profile.customUsername) {
          await deleteDoc(doc(db, "usernames", profile.customUsername.toLowerCase()));
        }

        // Create new username mapping
        await setDoc(usernameRef, { uid: profile.uid });
      }

      let newPhotoURL = editedProfile.photoURL;

      if (photoFile) {
        const photoRef = ref(storage, `profiles/${profile.uid}_${Date.now()}`);
        const uploadResult = await uploadBytes(photoRef, photoFile);
        newPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      let newIdCardUrl = editedProfile.idCardUrl;
      if (idFile) {
        const idRef = ref(storage, `id_cards/${profile.uid}_${Date.now()}`);
        const uploadResult = await uploadBytes(idRef, idFile);
        newIdCardUrl = await getDownloadURL(uploadResult.ref);
      }

      // Sync phone mapping if changed
      const oldPhone = (profile.phoneNumber || "").trim();
      const newPhone = (editedProfile.phoneNumber || "").trim();
      const oldNormalized = oldPhone ? normalizePhone(oldPhone) : "";
      const newNormalized = newPhone ? normalizePhone(newPhone) : "";

      if (newPhone !== oldPhone) {
        if (newPhone) {
          if (!/^[+]?[0-9]{8,15}$/.test(newPhone)) {
            setError("Invalid phone number format. Please provide 8 to 15 digits.");
            setIsSaving(false);
            return;
          }

          // Check if already registered by another account
          const mappingDoc = await getDoc(doc(db, "phone_mappings", newPhone));
          if (mappingDoc.exists() && mappingDoc.data().uid !== profile.uid) {
            setError("This phone number is already registered to another account.");
            setIsSaving(false);
            return;
          }
          if (newNormalized !== newPhone) {
            const normDoc = await getDoc(doc(db, "phone_mappings", newNormalized));
            if (normDoc.exists() && normDoc.data().uid !== profile.uid) {
              setError("This phone number (normalized) is already registered to another account.");
              setIsSaving(false);
              return;
            }
          }

          // Save new phone mapping
          await setDoc(doc(db, "phone_mappings", newPhone), {
            email: profile.email || "",
            uid: profile.uid,
            normalized: newNormalized
          });
          if (newNormalized !== newPhone) {
            await setDoc(doc(db, "phone_mappings", newNormalized), {
              email: profile.email || "",
              uid: profile.uid,
              original: newPhone
            });
          }
        }

        // Delete old phone mapping if empty or changed
        if (oldPhone) {
          try {
            await deleteDoc(doc(db, "phone_mappings", oldPhone));
            if (oldNormalized && oldNormalized !== oldPhone) {
              await deleteDoc(doc(db, "phone_mappings", oldNormalized));
            }
          } catch (delErr) {
            console.warn("Could not delete old phone mapping:", delErr);
          }
        }
      }

      const userRef = doc(db, "users", profile.uid);
      const updatedData = {
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        batch: editedProfile.batch,
        session: editedProfile.session,
        skills: editedProfile.skills.split(",").map(s => s.trim()).filter(Boolean),
        photoURL: newPhotoURL,
        idCardUrl: newIdCardUrl,
        facebookUrl: editedProfile.facebookUrl,
        phoneNumber: editedProfile.phoneNumber,
        customUsername: editedProfile.customUsername.toLowerCase(),
      };
      
      await updateDoc(userRef, updatedData);
      setProfile({ ...profile, ...updatedData } as UserProfile);
      setEditedProfile(prev => ({ ...prev, photoURL: newPhotoURL, idCardUrl: newIdCardUrl }));
      setPhotoFile(null);
      setPhotoPreview(null);
      setIdFile(null);
      setIdPreview(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to save. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-20 glass-card">
        <h2 className="text-2xl font-black text-white">Profile not found</h2>
        <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-orange-500 to-purple-600 relative">
          <div className="absolute -bottom-16 left-10 p-1.5 bg-[#050505] rounded-[2.5rem]">
            <div 
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={cn(
                "h-32 w-32 rounded-[2.2rem] overflow-hidden border-4 border-[#050505] bg-gray-800 group relative",
                isEditing ? "cursor-pointer" : "cursor-default"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
              <img 
                src={isEditing ? (photoPreview || editedProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`) : (profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`)} 
                alt="avatar" 
                className="h-full w-full object-cover" 
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[8px] font-black uppercase">Change Photo</span>
                </div>
              )}
            </div>
          </div>
          {isOwnProfile && !isEditing && (
            <div className="absolute bottom-4 right-6 flex items-center gap-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-all border border-white/10 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2 rounded-xl bg-red-500/80 hover:bg-red-600 active:scale-95 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all border border-red-500/20 cursor-pointer"
                title="Log Out from App"
              >
                <X className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}

          {isEditing && (
            <div className="absolute bottom-4 right-6 flex flex-wrap gap-3">
              {error && <span className="bg-red-500 text-white text-[10px] font-black px-3 py-2 rounded-xl animate-pulse">{error}</span>}
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
        
        <div className="pt-20 p-10 space-y-8">
          <div className="flex flex-col gap-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Unique Username</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" />
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:border-orange-500/50 font-bold"
                        value={editedProfile.customUsername}
                        onChange={e => setEditedProfile({...editedProfile, customUsername: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')})}
                        placeholder="Choose unique username"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Full Name</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
                      value={editedProfile.displayName}
                      onChange={e => setEditedProfile({...editedProfile, displayName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Profile Bio</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50 h-24 resize-none"
                      value={editedProfile.bio}
                      onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Facebook Profile Link</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
                      value={editedProfile.facebookUrl}
                      onChange={e => setEditedProfile({...editedProfile, facebookUrl: e.target.value})}
                      placeholder="https://facebook.com/your-id"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Mobile Number</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500/50"
                      value={editedProfile.phoneNumber}
                      onChange={e => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-white tracking-tight">{profile.displayName}</h1>
                  <div className="flex h-7 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 px-3 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">
                    @{profile.customUsername || profile.uid.slice(0, 8)}
                  </div>
                  {profile.isVerified && (
                    <div className="flex h-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 px-3 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                      Verified Student
                    </div>
                  )}
                </div>
                <p className="text-gray-400 font-medium max-w-xl">{profile.bio || "Mathematics student at G.B. College. Passionate about theorems and problem solving."}</p>
                
                <div className="flex gap-4 pt-2">
                  {profile.facebookUrl && (
                    <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all group">
                      <Facebook className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                    </a>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 group">
                      <Phone className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Department</span>
              <span className="text-sm font-bold text-white">Mathematics</span>
            </div>
            {isEditing ? (
              <>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Batch</span>
                  <input 
                    className="bg-transparent text-sm font-bold text-white outline-none"
                    value={editedProfile.batch}
                    onChange={e => setEditedProfile({...editedProfile, batch: e.target.value})}
                    placeholder="e.g. 2024-25"
                  />
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Semester</span>
                  <input 
                    className="bg-transparent text-sm font-bold text-white outline-none"
                    value={editedProfile.session}
                    onChange={e => setEditedProfile({...editedProfile, session: e.target.value})}
                    placeholder="e.g. 4th"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academic Year</span>
                  <span className="text-sm font-bold text-white">{profile.batch || "2024-25"}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Semester</span>
                  <span className="text-sm font-bold text-white">{ profile.session || "4th Semester" }</span>
                </div>
              </>
            )}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">GBC Status</span>
              <span className="text-sm font-bold text-orange-500 capitalize">{profile.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Award className="h-6 w-6 text-orange-500" /> Skills & Interests
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <p className="text-[10px] text-gray-500 uppercase font-black">Separate skills with commas</p>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500/50"
                  value={editedProfile.skills}
                  onChange={e => setEditedProfile({...editedProfile, skills: e.target.value})}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map(skill => (
                  <span key={skill} className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                    {skill}
                  </span>
                )) || (
                  <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                )}
              </div>
            )}
          </section>

          <section className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-500" /> Academic Verification
            </h2>

            <input 
              type="file" 
              ref={idFileInputRef}
              onChange={handleIdChange}
              accept="image/*,.pdf"
              className="hidden"
            />

            {(idPreview || profile.idCardUrl) ? (
              <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-video">
                <img 
                  src={idPreview || profile.idCardUrl} 
                  alt="ID Card" 
                  className="h-full w-full object-contain"
                />
                {isEditing && (
                  <div 
                    onClick={() => idFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white mb-2" />
                    <span className="text-xs font-black text-white uppercase">Replace ID Card</span>
                  </div>
                )}
                {!isEditing && (
                  <a 
                    href={profile.idCardUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            ) : (
              <div 
                onClick={() => isEditing && idFileInputRef.current?.click()}
                className={cn(
                  "aspect-video w-full rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 gap-4 group transition-all",
                  isEditing ? "hover:border-blue-500/30 cursor-pointer" : "cursor-default"
                )}
              >
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Upload Statistics / College ID</p>
                  <p className="text-xs">
                    {isEditing ? "Click to upload your GBC ID card" : "No ID card uploaded yet"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-500" /> Contact Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-500">Email Address</p>
                  <p className="text-sm font-bold text-white">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-500">Member ID</p>
                  <p className="text-sm font-bold text-white">#{profile.uid.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
