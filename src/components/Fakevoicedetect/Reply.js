import React from 'react';

const Reply = (props) => {
    return (
        <div className="reply-container">
            <div className="reply-text">
                {props.reply}
            </div>
        </div>
    );
};

export default Reply;