import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/Authcontext';
import Axios from 'axios';
import { recipe } from '../types';
import RecipeEditView from '../components/RecipeEditView/RecipeEditView';
import RecipeView from '../components/RecipeView/RecipeView';
import Loading from '../components/Loading/Loading';
import { useSnackbar } from 'notistack';
import { Types } from '../context/auth';

interface RecipeProps {
    match: {
        params: {
            id: String
        }
    }
}

const Recipe = (props: RecipeProps) => {
    const { state, dispatch } = useContext(AuthContext)
    const { enqueueSnackbar } = useSnackbar();
    const [edit, setEdit] = useState<boolean>(false)
    const [currentRecipe, setCurrentRecipe] = useState<recipe | undefined>(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        if(edit){
            dispatch({
                type: Types.Stay
            })
        } else {
            dispatch({
                type: Types.DontStay
            })
        }
    },[dispatch, edit])

    const recipeID = props.match.params.id

    // Fetch recipe. 
    useEffect(() => {

        if (recipeID === 'new') {
            setEdit(true)
            setCurrentRecipe({
                _id: '',
                name: '',
                ingredients: [],
                method: [],
                notes: [],
                authorName: '',
                prepTime: '',
                servings: '',
                isPublic: false
            })
            setLoading(false)
        } else {
            Axios({
                method: 'get',
                url: `/recipe/${recipeID}`,
                headers: { authToken: state.token }
            }).then((result) => {
                console.log(result);
                setCurrentRecipe(result.data)
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false)
            });
        }
    }, [recipeID, state, state.token]);

    const updateRecipe = (recipe: recipe) => {

        const {name, ingredients, method, prepTime, servings, isPublic } = recipe

        // Update database
        Axios({
            method: 'patch',
            url: `/recipe/${currentRecipe?._id}`,
            headers: {authToken: state.token},
            data: {
                name, ingredients, method, prepTime, servings, isPublic
            }
        }).then((result) => {
            if(result.status===200){
                setCurrentRecipe(result.data)
                enqueueSnackbar('Changes Saved', { variant: 'success' })
            }
        }).catch((err) => {
            
        }).finally(()=>{
            setEdit(false)
        });
    }

    if (loading) {
        return (<Loading/>)
    }
    if (!currentRecipe) { return null }

    //Show recipe view
    return (
        <>
        {edit ? 
        <RecipeEditView isNew={recipeID === 'new'} currentRecipe={currentRecipe} setCurrentRecipe={updateRecipe} setEdit={setEdit}/>
        : <RecipeView currentRecipe={currentRecipe} setCurrentRecipe={setCurrentRecipe} setEdit={setEdit}></RecipeView>}
        </>
    )
}

export default Recipe