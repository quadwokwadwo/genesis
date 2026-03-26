import React from 'react';
import Link from 'next/link';

function Access() {
    return (
        <div className="exception-body access">
            <img src={`/images/logo-white.svg`} alt="diamond-layout" className="logo" />

            <div className="exception-content">
                <div className="exception-title">ACCESS DENIED</div>
                <div className="exception-detail">You do not have the necessary permissions.</div>
                <Link href="/">Go to Dashboard</Link>
            </div>
        </div>
    );
}

export default Access;
