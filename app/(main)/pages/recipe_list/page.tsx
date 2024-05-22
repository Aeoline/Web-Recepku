/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '@/types';
import { firestore } from '@/utils/firebase';
import { collection, getDocs } from 'firebase/firestore/lite';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Divider } from 'primereact/divider';

interface InputValue {
    name: string;
    code: boolean;
}
const Crud = () => {
    let emptyProduct: Demo.Product = {
        id: '',
        name: '',
        image: '', // 'hapus' nanti,
        photoUrl: '',
        description: '',
        ingredients: '', // Ubah menjadi array kosong
        steps: '', // Ubah menjadi array kosong
        healthyCalories: 0,
        calories: 0,
        healthysteps: '',
        healthyIngredients: '', // Ubah menjadi array kosong
        category: '', // 'hapus' nanti,
        quantity: 0, // 'hapus' nanti,
        rating: 0, // 'hapus' nanti,
        inventoryStatus: 'USER' // 'hapus' nanti,
    };

    const [products, setProducts] = useState([]);
    const [recipeDialog, setRecipeDialog] = useState(false);
    const [deleterecipeDialog, setDeleterecipeDialog] = useState(false);
    const [deleteProductsDialog, setDeleteRecipeDialog] = useState(false);
    const [product, setProduct] = useState<Demo.Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
    const [dropdownValue, setDropdownValue] = useState(product.isFavorite ? 'true' : 'false');

    useEffect(() => {
        axios
            .get('http://localhost:3001/recipes')
            .then((res: any) => {
                // Ambil nilai isFavorite dari setiap objek makanan
                const data = res.data.data;

                setOriginalProducts(data); // Simpan data asli ke state originalProducts
                setProducts(data); // Simpan data ke state products
                console.log(data);
                const firstFood = data[0];
                console.log(firstFood.title);
                console.log(firstFood.description);
                console.log(firstFood.ingredients);
                console.log(firstFood.steps);
            })
            .catch((error: any) => {
                console.error(error);
            });
    }, []);

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setRecipeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRecipeDialog(false);
    };

    const hideDeleterecipeDialog = () => {
        setDeleterecipeDialog(false);
    };

    const hideDeleteRecipeDialog = () => {
        setDeleteRecipeDialog(false);
    };

    const handleSearch = (event: any) => {
        const searchInput = event.target.value;
        setSearchInput(searchInput);

        if (searchInput == '' || searchInput == null || searchInput == undefined || searchInput == ' ') {
            // Jika input pencarian kosong, perbarui products dengan data asli
            setProducts([...originalProducts]);
        } else {
            // Jika input pencarian tidak kosong, lakukan pencarian dan perbarui products dengan hasil pencarian
            fetch(`http://localhost:3001/recipes`)
                .then((response) => response.json())
                .then((data) => {
                    if (Array.isArray(data.data)) {
                        const transformedData = data.data
                            .filter((item: any) => {
                                const slugWords = item.slug.split(' ');
                                return slugWords.some((word: string) => word.toLowerCase().startsWith(searchInput.toLowerCase()));
                            })
                            .map((item: any) => ({
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                photoUrl: item.photoUrl,
                                calories: item.calories,
                                healthyCalories: item.healthyCalories,
                                ingredients: item.ingredients,
                                steps: item.steps,
                                healthyIngredients: item.healthyIngredients,
                                healthySteps: item.healthySteps,
                                isFavorite: item.isFavorite.name,
                                // Tambahkan properti lain yang Anda perlukan
                                // misalnya: ingredients, steps, dll.
                            }));

                        setProducts(transformedData);
                        console.log(transformedData);
                    } else {
                        console.error('Invalid data format');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (typeof product.title === 'string' && product.title.trim()) {
            let _products = [...products];
            let _product = { ...product, isFavorite: dropdownValue };

            if (product.id) {
                // Mengirim permintaan PUT ke server untuk memperbarui produk
                fetch(`http://localhost:3001/recipes/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: _product.title,
                        slug: _product.slug,
                        description: _product.description,
                        calories: _product.calories,
                        healthyCalories: _product.healthyCalories,
                        ingredients: _product.ingredients,
                        healthyIngredients: _product.healthyIngredients,
                        steps: _product.steps,
                        healthySteps: _product.healthySteps,
                        isFavorite: _product.isFavorite,
                        photoUrl: _product.photoUrl // Menggunakan uploadedPhotoUrl
                    })
                })
                    .then((response) => {
                        if (response.ok) {
                            const index = findIndexById(product.id);
                            _products[index] = _product;
                            setProducts(_products);
                            setRecipeDialog(false);
                            setProduct(emptyProduct);
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Product Updated',
                                life: 3000
                            });
                        } else {
                            throw new Error('Failed to update product');
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update product',
                            life: 3000
                        });
                    });
            } else {
                // Mengirim permintaan POST ke server untuk membuat produk baru
                fetch('http://localhost:3001/recipes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _product
                    })
                })
                fetch('http://localhost:3001/recipes', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                  })
                    .then((response) => {
                      if (response.ok) {
                        // Memperbarui data produk setelah berhasil dibuat
                        fetch('http://localhost:3001/recipes') // Mengambil semua produk dari server
                          .then((response) => response.json())
                          .then((item) => {
                            // Redirect ke halaman utama
                            window.location.href = 'http://localhost:3000/pages/recipe_list';
                          })
                          .catch((error) => {
                            console.log(error);
                            toast.current?.show({
                              severity: 'error',
                              summary: 'Error',
                              detail: 'Failed to create product',
                              life: 3000,
                            });
                          });
                      } else {
                        throw new Error('Failed to create product');
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                      toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create product',
                        life: 3000,
                      });
                    });
            }
        }
    };

    const editRecipe = (product: Demo.Product) => {
        setProduct({ ...product });
        setRecipeDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Product) => {
        setProduct(product);
        setDeleterecipeDialog(true);
    };

    const deleteProduct = () => {
        // Mengambil ID produk yang akan dihapus
        const productId = product.id;

        // Mengirim permintaan DELETE ke server
        fetch(`http://localhost:3001/recipes/${productId}`, {
            method: 'DELETE'
        })
            .then((response) => {
                if (response.ok) {
                    // Menghapus produk dari state
                    const updatedProducts = products.filter((val) => val.id !== productId);
                    setProducts(updatedProducts);
                    setDeleterecipeDialog(false);
                    setProduct(emptyProduct);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Product Deleted',
                        life: 3000
                    });
                } else {
                    throw new Error('Failed to delete product');
                }
            })
            .catch((error) => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete product',
                    life: 3000
                });
            });
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < (products as any)?.length; i++) {
            if ((products as any)[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteRecipeDialog(true);
    };

    const deleteSelectedProducts = () => {
        const selectedProductIds = selectedProducts.map((product) => product.id);

        // Mengirim permintaan DELETE ke server untuk menghapus produk yang dipilih
        fetch(`http://localhost:3001/recipes/${selectedProductIds.join(',')}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedProductIds })
        })
            .then((response) => {
                if (response.ok) {
                    // Menghapus produk dari state
                    const updatedProducts = products.filter((product) => !selectedProductIds.includes(product.id));
                    setProducts(updatedProducts);
                    setDeleteRecipeDialog(false);
                    setSelectedProducts([]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Products Deleted',
                        life: 3000
                    });
                } else {
                    throw new Error('Failed to delete products');
                }
            })
            .catch((error) => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete products',
                    life: 3000
                });
            });
    };

    const onCategoryChange = (e: RadioButtonChangeEvent) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return <React.Fragment></React.Fragment>;
    };

    const codeBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.id}
            </>
        );
    };

    const isFavoriteBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.isFavorite?.code ? "Yes" : "No"}
            </>
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        const name = rowData.title;
        const words = name.split(' ');
        const displayedWords = words.slice(0, 3).join(' '); // Gabungkan kata-kata pertama hingga ketiga dengan spasi

        return (
            <>
                <span className="p-column-title">Name</span>
                <div className="name-cell">
                    {displayedWords}
                    {words.length > 3 && (
                        <>
                            <br />
                            {words.slice(3).join(' ')}
                        </>
                    )}
                </div>
            </>
        );
    };

    const imageBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={rowData.photoUrl.toString()} alt={rowData.photoUrl.toString()} className="shadow-2" width="100" />
            </>
        );
    };

    const caloriesBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Calories</span>
                {rowData.calories}
            </>
        );
    };

    const categoryBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Healthy Calories</span>
                {rowData.healthyCalories}
            </>
        );
    };

    const ratingBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Reviews</span>
                <Rating value={rowData.rating} readOnly cancel={false} />
            </>
        );
    };

    const statusBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${rowData.inventoryStatus?.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editRecipe(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Products</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={handleSearch} placeholder="Search..." />
            </span>
        </div>
    );
    const recipeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );
    const deleterecipeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleterecipeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteRecipeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const dropdownValues: InputValue[] = [
        { name: 'Yes', code: true },
        { name: 'No', code: false }
    ];

    const onUploadPhoto = (event) => {
        const file = event.files[0];
    
        // Lakukan pengolahan atau unggah file ke server di sini
        // Setelah selesai, dapatkan URL foto yang diunggah dan simpan di state produk
        const reader = new FileReader();
        reader.onload = (e) => {
          const uploadedPhotoUrl = e.target.result;
          console.log(uploadedPhotoUrl); // Periksa URL foto yang diunggah di konsol
          setProduct({ ...product, photoUrl: uploadedPhotoUrl });
        };
        reader.readAsDataURL(file);
      };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No products found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="code" header="ID" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="title" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="calories" header="Calories" sortable body={caloriesBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="healthyCalories" header="Healthy Calories" sortable body={categoryBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="isFavorite" header="Is Recommended" body={isFavoriteBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={recipeDialog} style={{ width: '450px' }} header="Recipe Details" modal className="p-fluid" footer={recipeDialogFooter} onHide={hideDialog}>
                        <label htmlFor="name">Photo</label>
                        <div className="grid">
                            <div className="col-5 flex align-items-center justify-content-center">
                                <div className="p-fluid">
                                    <div className="field">{product.photoUrl && <img src={product.photoUrl.toString()} alt={product.photoUrl?.toString()} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />}</div>
                                </div>
                            </div>
                            <div className="col-1">
                                <Divider layout="vertical"></Divider>
                            </div>
                            <div className="col-5 items-center justify-center">
                                <Divider align="right">
                                    <FileUpload
                                        id="photo"
                                        name="photo"
                                        mode="basic"
                                        accept="image/*"
                                        chooseLabel="Upload"
                                        uploadLabel="Submit"
                                        cancelLabel="Cancel"
                                        customUpload
                                        uploadHandler={onUploadPhoto}
                                        className={classNames({
                                            'p-invalid': submitted && !product.photoUrl
                                        })}
                                    />
                                    {submitted && !product.photoUrl && <small className="p-invalid">Photo is required.</small>}
                                </Divider>

                                <Divider layout="horizontal" align="center">
                                    <b>OR</b>
                                </Divider>
                                <div className="field">
                                    <label htmlFor="photoUrl">PhotoUrl</label>
                                    <InputText
                                        id="name"
                                        value={product.photoUrl?.toString() ?? ''}
                                        onChange={(e) => onInputChange(e, 'photoUrl')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !product.photoUrl
                                        })}
                                    />
                                    {/* {submitted && !product.title && <small className="p-invalid">Name is required.</small>} */}
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText
                                id="name"
                                value={product.title?.toString() ?? ''}
                                onChange={(e) => onInputChange(e, 'title')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.title
                                })}
                            />
                            {submitted && !product.title && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="slug">Slug</label>
                            <InputText
                                id="slug"
                                value={product.slug?.toString() ?? ''}
                                onChange={(e) => onInputChange(e, 'slug')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !product.slug
                                })}
                            />
                            {submitted && !product.slug && <small className="p-invalid">Slug is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <InputTextarea
                                id="description"
                                value={product.description}
                                onChange={(e) => onInputChange(e, 'description')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.description
                                })}
                            />
                            {submitted && !product.description && <small className="p-invalid">Description is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="isFavorite">Is Recommended</label>
                            <Dropdown
                                id="isFavorite"
                                value={product.isFavorite}
                                onChange={(e) => setDropdownValue(e.value)}
                                options={dropdownValues}
                                optionLabel="name"
                                placeholder="Select"
                                className={classNames({
                                    'p-invalid': submitted && dropdownValue === null
                                })}
                            />
                            {submitted && dropdownValue === null && !product.isFavorite && <small className="p-invalid">This Field is required.</small>}
                        </div>

                        <h5>Normal Recipe</h5>
                        <div className="field">
                            <label htmlFor="calories">Calories</label>
                            <InputNumber
                                id="calories"
                                value={product.calories}
                                onValueChange={(e) => onInputNumberChange(e, 'calories')}
                                className={classNames({
                                    'p-invalid': submitted && !product.calories
                                })}
                            />
                            {submitted && !product.calories && <small className="p-invalid">Calories is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="ingredients">Ingredients</label>
                            <InputTextarea
                                id="ingredients"
                                value={product.ingredients}
                                onChange={(e) => onInputChange(e, 'ingredients')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.ingredients
                                })}
                            />
                            {submitted && !product.ingredients && <small className="p-invalid">Ingredients is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="steps">Steps</label>
                            <InputTextarea
                                id="steps"
                                value={product.steps}
                                onChange={(e) => onInputChange(e, 'steps')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.steps
                                })}
                            />
                            {submitted && !product.steps && <small className="p-invalid">Steps is required.</small>}
                        </div>

                        <h5>Healthy Recipe</h5>
                        <div className="field">
                            <label htmlFor="healthyCalories">Calories</label>
                            <InputNumber
                                id="healthyCalories"
                                value={product.healthyCalories}
                                onValueChange={(e) => onInputNumberChange(e, 'healthyCalories')}
                                className={classNames({
                                    'p-invalid': submitted && !product.healthyCalories
                                })}
                            />
                            {submitted && !product.healthyCalories && <small className="p-invalid">Calories is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="healthyIngredients">Ingredients</label>
                            <InputTextarea
                                id="healthyIngredients"
                                value={product.healthyIngredients}
                                onChange={(e) => onInputChange(e, 'healthyIngredients')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.healthyIngredients
                                })}
                            />
                            {submitted && !product.healthyIngredients && <small className="p-invalid">Ingredients is required.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="healthySteps">Steps</label>
                            <InputTextarea
                                id="healthySteps"
                                value={product.healthySteps}
                                onChange={(e) => onInputChange(e, 'healthySteps')}
                                required
                                rows={3}
                                cols={20}
                                className={classNames({
                                    'p-invalid': submitted && !product.healthySteps
                                })}
                            />
                            {submitted && !product.healthySteps && <small className="p-invalid">Steps is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleterecipeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleterecipeDialogFooter} onHide={hideDeleterecipeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    Are you sure you want to delete <b>{product.title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteRecipeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
