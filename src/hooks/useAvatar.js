import { useCallback, useEffect, useState } from 'react';
import {
    getSavedAvatar,
    removeSavedAvatar,
    saveAvatarFile,
    subscribeAvatarChanges,
} from '../services/avatarService';

export default function useAvatar(user, fallbackAvatar) {
    const [avatarSrc, setAvatarSrc] = useState(() => getSavedAvatar(user) || fallbackAvatar);

    const refreshAvatar = useCallback(() => {
        setAvatarSrc(getSavedAvatar(user) || fallbackAvatar);
    }, [fallbackAvatar, user]);

    useEffect(() => {
        refreshAvatar();
        return subscribeAvatarChanges(refreshAvatar);
    }, [refreshAvatar]);

    const saveAvatar = useCallback(async (file) => {
        const nextAvatarSrc = await saveAvatarFile(user, file);
        setAvatarSrc(nextAvatarSrc);
        return nextAvatarSrc;
    }, [user]);

    const removeAvatar = useCallback(async () => {
        await removeSavedAvatar(user);
        setAvatarSrc(fallbackAvatar);
    }, [fallbackAvatar, user]);

    return {
        avatarSrc,
        saveAvatar,
        removeAvatar,
    };
}
