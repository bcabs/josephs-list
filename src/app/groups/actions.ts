'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function inviteUserToGroupAction(groupId: string, email: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 1. Authenticate caller
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUser) {
    throw new Error('Unauthorized')
  }

  // 2. Authorization: Check if caller is admin of the group
  // We verify this using the admin client to ensure we get the group data
  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .select('admin_id')
    .eq('id', groupId)
    .single()
  
  if (groupError || !group) {
    throw new Error('Group not found')
  }

  if (group.admin_id !== currentUser.id) {
     throw new Error('You do not have permission to invite users to this group')
  }

  // 3. Check if the user to be invited exists
  const { data: existingUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  let targetUserId = existingUser?.id

  if (!targetUserId) {
    // User does not exist, invite them
    // This sends an email and creates the user in auth.users
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    
    if (inviteError) {
      throw new Error(`Failed to invite user: ${inviteError.message}`)
    }
    
    targetUserId = inviteData.user.id
  }

  // 4. Add to group members
  // Check if already a member
  const { data: existingMember } = await supabaseAdmin
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .single()

  if (existingMember) {
      return { success: false, message: 'User is already a member of this group' }
  }

  const { error: insertError } = await supabaseAdmin
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: targetUserId,
      role: 'member'
    })

  if (insertError) {
    throw new Error(`Failed to add member: ${insertError.message}`)
  }

  return { success: true, message: 'User invited successfully' }
}
