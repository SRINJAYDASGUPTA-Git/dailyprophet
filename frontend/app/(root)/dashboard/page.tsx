"use client"

import React from 'react'
import {useUser} from "@/providers/UserContext";
import {useRouter} from "next/navigation";

const Dashboard = () => {
    const {user, loading:userLoading} = useUser();
    const router = useRouter();
    if(!user && !userLoading){
        router.push("/login");
    }
    return (
        <div>
            Dashboard
            <div>
                {!user && userLoading ? (
                    <p>
                        Loading
                    </p>
                ):(
                    <div>
                        Id : {user?.id} <br/>
                        Name: {user?.name} <br/>
                        Username: {user?.username} <br/>
                        Email: {user?.email} <br/>
                        ImageUrl: {user?.imageUrl} <br/>

                    </div>
                )}
            </div>
        </div>


    )
}
export default Dashboard
