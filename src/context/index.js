import { AuthProvider, useAuthContext } from "./AuthContext";
import { ConfirmationProvider, useConfirmationContext } from "./ConfirmationContext";
import { TablesProvider, useTableContext } from "./TablesContext";
import { UsersProvider, useUsersContext } from "./UsersContext";

export {
    useAuthContext,
    useTableContext,
    useUsersContext,
    useConfirmationContext
}

export function ContextManager({children}){
    return(
        <AuthProvider>
            <UsersProvider>
                <ConfirmationProvider>
                    <TablesProvider>
                        {children}
                    </TablesProvider>
                </ConfirmationProvider>
            </UsersProvider>
        </AuthProvider>
    );
}