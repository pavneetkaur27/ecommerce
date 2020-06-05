import React from 'react';

export default function Loader(_p) {
   
    return (
        (_p && (_p.loading===true || _p.loading==='true')) ?
        (<div>
            <div className="visible-loader">
               
            </div>
        </div>) : null
    )
}