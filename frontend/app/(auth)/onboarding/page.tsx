"use client"

import React from 'react'
import {useUser} from "@/providers/UserContext";

function OnboardingForm() {
    const {user, loading: userLoading} = useUser();
    if (user && !userLoading) {
        console.log("user loaded");
        console.log(user);
    }
    return (
        <div> OnboardingForm </div>
    )
}

export default OnboardingForm
