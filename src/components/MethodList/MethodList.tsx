import React, { useContext, useState, ChangeEvent, useEffect } from 'react'
import { makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    }
}));

interface MethodListProps {
    method: string[]
}

const MethodList = (props: MethodListProps) => {

    const classes = useStyles()

    const { method } = props

    return (
        <ol className={classes.root} >
            {method.map((e, i) => (<li>{e}</li>))}
        </ol>

    )
}

export default MethodList