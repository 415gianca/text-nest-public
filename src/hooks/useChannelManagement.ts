
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Channel, Message, User } from '@/providers/ChatProvider';
import { generate as generateId } from 'shortid';

const useChannelManagement = (
  user: User | null,
  channels: Channel[],
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>,
  setCurrentChannelId: React.Dispatch<React.SetStateAction<string>>,
  getAllUsers: () => User[]
) => {
  
  const createChannel = useCallback(
    async (name: string, participantIds: string[], isPrivate: boolean = false) => {
      if (!user) {
        toast.error('You must be logged in to create a channel');
        return;
      }
      
      const type = participantIds.length === 1 ? 'direct' : 'group';
      
      try {
        // Create channel in Supabase
        const { data: channelData, error: channelError } = await supabase
          .from('channels')
          .insert({
            name,
            type,
            creator_id: user.id,
            is_private: isPrivate
          })
          .select()
          .single();
        
        if (channelError) {
          console.error('Error creating channel:', channelError);
          throw new Error('Failed to create channel');
        }
        
        // Add participants to channel (including the creator)
        const allParticipants = [...new Set([user.id, ...participantIds])];
        const participantInserts = allParticipants.map(userId => ({
          channel_id: channelData.id,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('channel_participants')
          .insert(participantInserts);
        
        if (participantsError) {
          console.error('Error adding participants:', participantsError);
          throw new Error('Failed to add participants');
        }
        
        // Create the channel locally
        const newChannel: Channel = {
          id: channelData.id,
          name: channelData.name,
          type: channelData.type as 'direct' | 'group',
          participants: allParticipants,
          messages: [],
          isPrivate: channelData.is_private,
          creatorId: channelData.creator_id,
          nicknames: {}
        };
        
        setChannels(prev => [...prev, newChannel]);
        setCurrentChannelId(newChannel.id);
        return newChannel;
      } catch (error) {
        console.error('Error in createChannel:', error);
        throw error;
      }
    },
    [user, setChannels, setCurrentChannelId]
  );
  
  const setNickname = useCallback(
    async (channelId: string, userId: string, nickname: string) => {
      if (!user) {
        toast.error('You must be logged in to set nicknames');
        return;
      }
      
      try {
        // Update nickname in Supabase
        const { error } = await supabase
          .from('channel_participants')
          .update({ nickname })
          .eq('channel_id', channelId)
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error updating nickname:', error);
          throw new Error('Failed to update nickname');
        }
        
        // Update the nickname locally
        setChannels(prev => 
          prev.map(channel => 
            channel.id === channelId 
              ? { ...channel, nicknames: { ...channel.nicknames, [userId]: nickname } }
              : channel
          )
        );
      } catch (error) {
        console.error('Error in setNickname:', error);
        throw error;
      }
    },
    [user, setChannels]
  );
  
  const createDirectMessage = useCallback(
    async (recipientId: string) => {
      if (!user) {
        toast.error('You must be logged in to create a direct message');
        return;
      }
      
      // Check if a DM already exists with this user
      const existingDM = channels.find(
        channel => 
          channel.type === 'direct' && 
          channel.participants.includes(user.id) && 
          channel.participants.includes(recipientId)
      );
      
      if (existingDM) {
        setCurrentChannelId(existingDM.id);
        return existingDM;
      }
      
      // Get recipient details
      const recipient = getAllUsers().find(u => u.id === recipientId);
      if (!recipient) {
        toast.error('User not found');
        return;
      }
      
      // Create a new DM channel
      return createChannel(recipient.username, [recipientId], true);
    },
    [user, channels, setCurrentChannelId, createChannel, getAllUsers]
  );
  
  return {
    createChannel,
    setNickname,
    createDirectMessage
  };
};

export default useChannelManagement;
